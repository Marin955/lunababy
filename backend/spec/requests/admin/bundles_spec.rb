require "rails_helper"

RSpec.describe "Admin Bundles", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:bundle) { create(:bundle, :with_items, slug: "sleep-bundle", stock_quantity: 10) }

  describe "GET /admin/bundles" do
    it "returns all bundles (including inactive) for admin" do
      create(:bundle, :inactive, slug: "hidden-bundle")

      get "/admin/bundles", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      slugs = response.parsed_body["data"].map { |b| b["slug"] }
      expect(slugs).to include("sleep-bundle", "hidden-bundle")
    end

    it "returns 403 for non-admin" do
      get "/admin/bundles", headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /admin/bundles/:id" do
    it "updates stock quantity" do
      patch "/admin/bundles/#{bundle.id}", params: { stock_quantity: 25 }, headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(bundle.reload.stock_quantity).to eq(25)
    end

    it "updates bundle active status" do
      patch "/admin/bundles/#{bundle.id}", params: { active: false }, headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(bundle.reload.active).to be false
    end

    it "updates bundle price" do
      patch "/admin/bundles/#{bundle.id}", params: { price: 7990 }, headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(bundle.reload.price).to eq(7990)
    end

    it "returns 403 for non-admin" do
      patch "/admin/bundles/#{bundle.id}", params: { stock_quantity: 0 }, headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end
end
