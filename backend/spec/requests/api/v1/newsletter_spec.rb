require "rails_helper"

RSpec.describe "API V1 Newsletter", type: :request do
  describe "POST /api/v1/newsletter/subscribe" do
    it "subscribes a new email" do
      post "/api/v1/newsletter/subscribe", params: { email: "test@example.com" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to include("subscribed")
      expect(NewsletterSubscriber.find_by(email: "test@example.com")).to be_present
    end

    it "sets language when provided" do
      post "/api/v1/newsletter/subscribe", params: { email: "test@example.com", language: "en" }

      subscriber = NewsletterSubscriber.find_by(email: "test@example.com")
      expect(subscriber.language).to eq("en")
    end

    it "reactivates an existing inactive subscriber" do
      subscriber = create(:newsletter_subscriber, email: "returning@example.com", active: false)

      post "/api/v1/newsletter/subscribe", params: { email: "returning@example.com" }

      expect(response).to have_http_status(:ok)
      expect(subscriber.reload.active).to be true
    end

    it "handles duplicate subscription gracefully" do
      create(:newsletter_subscriber, email: "existing@example.com")

      post "/api/v1/newsletter/subscribe", params: { email: "existing@example.com" }

      expect(response).to have_http_status(:ok)
      expect(NewsletterSubscriber.where(email: "existing@example.com").count).to eq(1)
    end

    it "rejects invalid email" do
      post "/api/v1/newsletter/subscribe", params: { email: "not-an-email" }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects blank email" do
      post "/api/v1/newsletter/subscribe", params: { email: "" }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
