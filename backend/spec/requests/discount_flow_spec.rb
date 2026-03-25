require "rails_helper"

RSpec.describe "Discount flow", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:bundle) { create(:bundle, :with_items, slug: "test-bundle", price: 10000, stock_quantity: 20) }

  describe "Admin sets a discount" do
    it "applies discount and computes sale price" do
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 25 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(25)
      expect(data["original_price"]).to eq(10000)
      expect(data["price"]).to eq(7500) # 10000 * 0.75

      bundle.reload
      expect(bundle.price).to eq(7500)
      expect(bundle.original_price).to eq(10000)
      expect(bundle.discount_percent).to eq(25)
    end

    it "updates discount percentage on already-discounted bundle" do
      # First apply 20%
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 20 },
        headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)

      # Then change to 50%
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 50 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(50)
      expect(data["original_price"]).to eq(10000)
      expect(data["price"]).to eq(5000)
    end

    it "removes discount and restores original price" do
      # Apply discount first
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 30 },
        headers: auth_headers(admin)

      expect(bundle.reload.price).to eq(7000)

      # Remove discount
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 0 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(0)
      expect(data["original_price"]).to be_nil
      expect(data["price"]).to eq(10000)
    end

    it "allows setting price and discount together" do
      patch "/admin/bundles/#{bundle.id}",
        params: { original_price: 20000, discount_percent: 10 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["original_price"]).to eq(20000)
      expect(data["discount_percent"]).to eq(10)
      expect(data["price"]).to eq(18000) # 20000 * 0.90
    end

    it "rejects discount_percent > 100" do
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 150 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects negative discount_percent" do
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: -5 },
        headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "Public API includes discount fields" do
    before do
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 20 },
        headers: auth_headers(admin)
    end

    it "returns discount_percent in bundle list" do
      get "/api/v1/bundles"

      data = response.parsed_body["data"]
      discounted = data.find { |b| b["slug"] == "test-bundle" }
      expect(discounted["discount_percent"]).to eq(20)
      expect(discounted["original_price"]).to eq(10000)
      expect(discounted["price"]).to eq(8000)
    end

    it "returns discount_percent in bundle detail" do
      get "/api/v1/bundles/test-bundle"

      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(20)
      expect(data["original_price"]).to eq(10000)
      expect(data["price"]).to eq(8000)
    end

    it "returns discount_percent=0 for non-discounted bundles" do
      other = create(:bundle, slug: "regular-bundle", price: 5000)

      get "/api/v1/bundles"

      data = response.parsed_body["data"]
      regular = data.find { |b| b["slug"] == "regular-bundle" }
      expect(regular["discount_percent"]).to eq(0)
      expect(regular["original_price"]).to be_nil
    end
  end

  describe "Order uses discounted price" do
    let!(:shipping_method) { create(:shipping_method) }

    before do
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 20 },
        headers: auth_headers(admin)
    end

    it "creates order with sale price as unit_price" do
      post "/api/v1/orders", params: {
        customer_email: "buyer@example.com",
        customer_name: "Test User",
        shipping_method_id: shipping_method.id,
        shipping_address: {
          first_name: "Test",
          last_name: "User",
          street: "Test St 1",
          postal_code: "10000",
          city: "Zagreb",
          phone: "0991234567"
        },
        items: [{ bundle_id: bundle.id, quantity: 2 }]
      }

      expect(response).to have_http_status(:created)
      order = response.parsed_body["data"]
      item = order["items"].first
      expect(item["unit_price"]).to eq(8000) # discounted price
      expect(item["line_total"]).to eq(16000) # 8000 * 2
    end
  end

  describe "Full discount lifecycle" do
    it "apply → verify in API → remove → verify restored" do
      # 1. No discount initially
      get "/api/v1/bundles/test-bundle"
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(0)
      expect(data["price"]).to eq(10000)
      expect(data["original_price"]).to be_nil

      # 2. Admin applies 15% discount
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 15 },
        headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)

      # 3. Verify public API shows discount
      get "/api/v1/bundles/test-bundle"
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(15)
      expect(data["original_price"]).to eq(10000)
      expect(data["price"]).to eq(8500)

      # 4. Admin removes discount
      patch "/admin/bundles/#{bundle.id}",
        params: { discount_percent: 0 },
        headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)

      # 5. Verify public API shows restored price
      get "/api/v1/bundles/test-bundle"
      data = response.parsed_body["data"]
      expect(data["discount_percent"]).to eq(0)
      expect(data["original_price"]).to be_nil
      expect(data["price"]).to eq(10000)
    end
  end
end
