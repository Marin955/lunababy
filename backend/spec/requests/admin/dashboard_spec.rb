require "rails_helper"

RSpec.describe "Admin Dashboard", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }

  describe "GET /admin/dashboard" do
    it "returns dashboard stats for admin" do
      shipping = create(:shipping_method)
      create_list(:order, 3, shipping_method: shipping)

      get "/admin/dashboard", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["total_orders"]).to eq(3)
      expect(json["revenue_total"]).to be_a(Integer)
      expect(json["recent_orders"]).to be_an(Array)
      expect(json["low_stock_products"]).to be_an(Array)
      expect(json["orders_by_status"]).to be_a(Hash)
    end

    it "returns 403 for non-admin user" do
      get "/admin/dashboard", headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 without auth token" do
      get "/admin/dashboard"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
