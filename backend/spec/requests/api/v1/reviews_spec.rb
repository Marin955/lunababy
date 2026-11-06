require "rails_helper"

RSpec.describe "Api::V1::Reviews", type: :request do
  let(:bundle) { create(:bundle, slug: "sleeping-bundle", name_hr: "Paket za spavanje", name_en: "Sleeping bundle") }
  let(:review) { create(:review, bundle: bundle) }
  let(:valid_params) { { rating: 4, title: "Super", body: "Vreća za spavanje je mekana i topla.", consent: true } }

  describe "GET /api/v1/bundles/:slug/reviews" do
    it "returns only approved reviews, newest first, with the summary" do
      older = create(:review, :approved, bundle: bundle, rating: 5, approved_at: 2.days.ago)
      newer = create(:review, :approved, bundle: bundle, rating: 4, approved_at: 1.hour.ago)
      create(:review, :submitted, bundle: bundle, rating: 1, body: "Pending review text")
      create(:review, :rejected, bundle: bundle, rating: 1, body: "Rejected review text")
      create(:review, bundle: bundle)

      get "/api/v1/bundles/sleeping-bundle/reviews"

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"].map { |r| r["id"] }).to eq([ newer.id, older.id ])
      expect(json["meta"]).to include("average_rating" => 4.5, "total_count" => 2, "total_pages" => 1)
      expect(response.body).not_to include("Pending review text", "Rejected review text")
    end

    it "never exposes order, email or token data" do
      approved = create(:review, :approved, bundle: bundle)
      get "/api/v1/bundles/sleeping-bundle/reviews"

      row = response.parsed_body["data"].first
      expect(row.keys).to contain_exactly("id", "rating", "title", "body", "author_display_name", "locale",
                                          "published_at", "verified_purchase")
      expect(response.body).not_to include(approved.token, approved.order.customer_email)
    end

    it "returns an empty list and no average when nothing is approved" do
      create(:review, :submitted, bundle: bundle)
      get "/api/v1/bundles/sleeping-bundle/reviews"

      expect(response.parsed_body["data"]).to eq([])
      expect(response.parsed_body["meta"]).to include("average_rating" => nil, "total_count" => 0)
    end

    it "paginates" do
      create_list(:review, 3, :approved, bundle: bundle)
      get "/api/v1/bundles/sleeping-bundle/reviews", params: { per: 2, page: 2 }

      expect(response.parsed_body["data"].size).to eq(1)
      expect(response.parsed_body["meta"]).to include("current_page" => 2, "total_pages" => 2)
    end

    it "returns 404 for an unknown bundle" do
      get "/api/v1/bundles/nope/reviews"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /api/v1/reviews/:token" do
    it "returns the form context in the requested locale" do
      get "/api/v1/reviews/#{review.token}", params: { locale: "en" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["bundle"]).to include("name" => "Sleeping bundle", "slug" => "sleeping-bundle")
      expect(response.parsed_body["data"]["author_display_name"]).to eq("Ana K.")
    end

    it "returns 404 for an unknown token" do
      get "/api/v1/reviews/does-not-exist"
      expect(response).to have_http_status(:not_found)
    end

    it "returns 410 expired for an expired token" do
      expired = create(:review, :expired, bundle: bundle)
      get "/api/v1/reviews/#{expired.token}"

      expect(response).to have_http_status(:gone)
      expect(response.parsed_body["code"]).to eq("expired")
    end

    it "returns 410 used for a submitted review" do
      used = create(:review, :submitted, bundle: bundle)
      get "/api/v1/reviews/#{used.token}"

      expect(response).to have_http_status(:gone)
      expect(response.parsed_body["code"]).to eq("used")
    end
  end

  describe "POST /api/v1/reviews/:token" do
    it "submits the review as pending moderation" do
      post "/api/v1/reviews/#{review.token}", params: valid_params

      expect(response).to have_http_status(:created)
      review.reload
      expect(review).to be_pending
      expect(review.submitted_at).to be_present
      expect(review.rating).to eq(4)
      expect(review.body).to eq("Vreća za spavanje je mekana i topla.")
    end

    it "records the language the review was written in" do
      post "/api/v1/reviews/#{review.token}", params: valid_params.merge(locale: "en")
      expect(review.reload.locale).to eq("en")
    end

    it "does not publish the review until an admin approves it" do
      post "/api/v1/reviews/#{review.token}", params: valid_params
      get "/api/v1/bundles/sleeping-bundle/reviews"

      expect(response.parsed_body["data"]).to eq([])
    end

    it "accepts the token only once" do
      post "/api/v1/reviews/#{review.token}", params: valid_params
      post "/api/v1/reviews/#{review.token}", params: valid_params.merge(rating: 1)

      expect(response).to have_http_status(:gone)
      expect(response.parsed_body["code"]).to eq("used")
      expect(review.reload.rating).to eq(4)
    end

    it "rejects an expired token" do
      expired = create(:review, :expired, bundle: bundle)
      post "/api/v1/reviews/#{expired.token}", params: valid_params

      expect(response).to have_http_status(:gone)
      expect(expired.reload.submitted_at).to be_nil
    end

    it "requires consent" do
      post "/api/v1/reviews/#{review.token}", params: valid_params.merge(consent: false)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to have_key("consent")
      expect(review.reload.submitted_at).to be_nil
    end

    it "returns validation errors and keeps the token usable" do
      post "/api/v1/reviews/#{review.token}", params: valid_params.merge(rating: 7, body: "")

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"].keys).to include("rating", "body")
      expect(review.reload.token_state).to eq(:open)
    end

    it "ignores attempts to set the status directly" do
      post "/api/v1/reviews/#{review.token}", params: valid_params.merge(status: "approved", approved_at: Time.current)

      expect(review.reload).to be_pending
      expect(review.approved_at).to be_nil
    end
  end
end
