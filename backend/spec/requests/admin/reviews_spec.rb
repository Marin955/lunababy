require "rails_helper"

RSpec.describe "Admin::Reviews", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:customer) { create(:user) }
  let(:bundle) { create(:bundle, slug: "bath-bundle") }

  describe "GET /admin/reviews" do
    it "returns 401 without a token and 403 for customers" do
      get "/admin/reviews"
      expect(response).to have_http_status(:unauthorized)

      get "/admin/reviews", headers: auth_headers(customer)
      expect(response).to have_http_status(:forbidden)
    end

    it "lists submitted reviews only, with a status filter and counts" do
      pending_review = create(:review, :submitted, bundle: bundle)
      approved = create(:review, :approved, bundle: bundle)
      create(:review, bundle: bundle) # request sent, not answered

      get "/admin/reviews", headers: auth_headers(admin)
      json = response.parsed_body
      expect(json["data"].map { |r| r["id"] }).to contain_exactly(pending_review.id, approved.id)
      expect(json["data"].first).to include("order_number", "customer_email", "bundle")
      expect(json["meta"]["counts"]).to eq("pending" => 1, "approved" => 1)

      get "/admin/reviews", params: { status: "pending" }, headers: auth_headers(admin)
      expect(response.parsed_body["data"].map { |r| r["id"] }).to eq([ pending_review.id ])
    end
  end

  describe "PATCH /admin/reviews/:id/approve" do
    let(:review) { create(:review, :submitted, bundle: bundle) }

    it "forbids customers" do
      patch "/admin/reviews/#{review.id}/approve", headers: auth_headers(customer)
      expect(response).to have_http_status(:forbidden)
      expect(review.reload).to be_pending
    end

    it "approves, writes an audit log and makes the review public" do
      expect {
        patch "/admin/reviews/#{review.id}/approve", headers: auth_headers(admin)
      }.to change(AdminAuditLog, :count).by(1)

      expect(response).to have_http_status(:ok)
      expect(review.reload).to be_approved
      expect(review.approved_at).to be_present

      log = AdminAuditLog.last
      expect(log.action).to eq("review.approved")
      expect(log.target_id).to eq(review.id)
      expect(log.change_data).to eq("from" => "pending", "to" => "approved")

      get "/api/v1/bundles/bath-bundle/reviews"
      expect(response.parsed_body["data"].map { |r| r["id"] }).to eq([ review.id ])
    end

    it "returns 404 for a request the customer has not answered" do
      unanswered = create(:review, bundle: bundle)
      patch "/admin/reviews/#{unanswered.id}/approve", headers: auth_headers(admin)

      expect(response).to have_http_status(:not_found)
      expect(unanswered.reload).to be_pending
    end
  end

  describe "PATCH /admin/reviews/:id/reject" do
    it "rejects (also after approval) and hides the review again" do
      review = create(:review, :approved, bundle: bundle)
      patch "/admin/reviews/#{review.id}/reject", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(review.reload).to be_rejected
      expect(review.approved_at).to be_nil
      expect(AdminAuditLog.last.action).to eq("review.rejected")

      get "/api/v1/bundles/bath-bundle/reviews"
      expect(response.parsed_body["data"]).to eq([])
    end
  end
end
