require "rails_helper"

RSpec.describe "API V1 Orders", type: :request do
  let!(:user) { create(:user) }
  let!(:bundle) { create(:bundle, slug: "sleep-bundle", price: 3990, stock_quantity: 10) }
  let!(:shipping_method) { create(:shipping_method, slug: "standard", price: 350, free_threshold: 5000) }

  let(:valid_order_params) do
    {
      customer_email: "buyer@example.com",
      customer_name: "John Doe",
      shipping_method_id: shipping_method.id,
      language: "hr",
      shipping_address: {
        first_name: "John",
        last_name: "Doe",
        street: "Ilica 1",
        city: "Zagreb",
        postal_code: "10000",
        phone: "+385911234567"
      },
      items: [
        { bundle_id: bundle.id, quantity: 1 }
      ]
    }
  end

  describe "POST /api/v1/orders" do
    it "creates a guest order" do
      post "/api/v1/orders", params: valid_order_params

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["order_number"]).to start_with("LB-")
      expect(json["status"]).to eq("pending")
      expect(json["subtotal"]).to eq(3990)
      expect(json["shipping_cost"]).to eq(350)
      expect(json["total"]).to eq(4340)
    end

    it "creates an authenticated order" do
      post "/api/v1/orders", params: valid_order_params, headers: auth_headers(user)

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["order_number"]).to be_present
      expect(Order.last.user_id).to eq(user.id)
    end

    it "creates order with multiple items" do
      bundle2 = create(:bundle, slug: "feeding-bundle", price: 4990, stock_quantity: 5)
      params = valid_order_params.deep_dup
      params[:items] << { bundle_id: bundle2.id, quantity: 2 }

      post "/api/v1/orders", params: params

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["subtotal"]).to eq(3990 + 4990 * 2)
    end

    it "applies a percentage promo code" do
      create(:promo_code, code: "SAVE10", discount_type: :percentage, value: 10)
      params = valid_order_params.merge(promo_code: "SAVE10")

      post "/api/v1/orders", params: params

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["discount_amount"]).to eq(399)
      expect(json["total"]).to eq(3990 - 399 + 350)
    end

    it "decrements bundle stock" do
      post "/api/v1/orders", params: valid_order_params

      expect(response).to have_http_status(:created)
      expect(bundle.reload.stock_quantity).to eq(9)
    end

    it "rejects order with out-of-stock bundle" do
      bundle.update!(stock_quantity: 0)

      post "/api/v1/orders", params: valid_order_params

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("out of stock")
    end

    it "rejects order with empty items" do
      params = valid_order_params.merge(items: [])

      post "/api/v1/orders", params: params

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Items are required")
    end

    it "gives free shipping when above threshold" do
      expensive_bundle = create(:bundle, slug: "premium", price: 6000, stock_quantity: 5)
      params = valid_order_params.deep_dup
      params[:items] = [{ bundle_id: expensive_bundle.id, quantity: 1 }]

      post "/api/v1/orders", params: params

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["shipping_cost"]).to eq(0)
      expect(json["total"]).to eq(6000)
    end
  end

  describe "GET /api/v1/orders/:order_number" do
    it "returns order by order_number for authenticated user" do
      order = create(:order, :with_items, user: user)

      get "/api/v1/orders/#{order.order_number}", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["order_number"]).to eq(order.order_number)
    end

    it "returns order for guest with email" do
      order = create(:order, :with_items, customer_email: "guest@example.com")

      get "/api/v1/orders/#{order.order_number}", params: { email: "guest@example.com" }

      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for wrong email on guest lookup" do
      order = create(:order, :with_items, customer_email: "guest@example.com")

      get "/api/v1/orders/#{order.order_number}", params: { email: "wrong@example.com" }

      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for nonexistent order" do
      get "/api/v1/orders/LB-99999999-XXXXX", headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /api/v1/orders" do
    it "returns user orders when authenticated" do
      create_list(:order, 3, user: user, shipping_method: shipping_method)

      get "/api/v1/orders", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].length).to eq(3)
      expect(response.parsed_body["meta"]).to include("total_count")
    end

    it "returns 401 without auth token" do
      get "/api/v1/orders"

      expect(response).to have_http_status(:unauthorized)
    end

    it "does not return other users' orders" do
      other_user = create(:user)
      create(:order, user: other_user, shipping_method: shipping_method)
      create(:order, user: user, shipping_method: shipping_method)

      get "/api/v1/orders", headers: auth_headers(user)

      expect(response.parsed_body["data"].length).to eq(1)
    end
  end

  describe "GET /api/v1/orders/:order_number/lookup" do
    it "returns order for guest by email and order_number" do
      order = create(:order, customer_email: "guest@example.com", shipping_method: shipping_method)

      get "/api/v1/orders/#{order.order_number}/lookup", params: { email: "guest@example.com" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["order_number"]).to eq(order.order_number)
    end

    it "returns 404 for wrong email" do
      order = create(:order, customer_email: "guest@example.com", shipping_method: shipping_method)

      get "/api/v1/orders/#{order.order_number}/lookup", params: { email: "wrong@example.com" }

      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for nonexistent order" do
      get "/api/v1/orders/LB-00000000-XXXXX/lookup", params: { email: "guest@example.com" }

      expect(response).to have_http_status(:not_found)
    end
  end
end
