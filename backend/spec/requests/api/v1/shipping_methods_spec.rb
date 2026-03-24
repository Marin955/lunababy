require "rails_helper"

RSpec.describe "API V1 Shipping Methods", type: :request do
  let!(:standard) { create(:shipping_method, slug: "standard", name_hr: "Standardna dostava", name_en: "Standard Delivery", price: 350, position: 0) }
  let!(:express) { create(:shipping_method, slug: "express", name_hr: "Ekspresna dostava", name_en: "Express Delivery", price: 599, free_threshold: nil, position: 1) }
  let!(:inactive) { create(:shipping_method, slug: "inactive", active: false) }

  describe "GET /api/v1/shipping_methods" do
    it "returns all active shipping methods" do
      get "/api/v1/shipping_methods"

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"].length).to eq(2)
    end

    it "returns expected fields in HR locale" do
      get "/api/v1/shipping_methods"

      method = response.parsed_body["data"][0]
      expect(method).to include(
        "id", "slug", "name", "carrier", "description",
        "price", "estimated_days", "free_threshold"
      )
      expect(method["name"]).to eq("Standardna dostava")
      expect(method["price"]).to eq(350)
    end

    it "returns EN locale names" do
      get "/api/v1/shipping_methods", params: { locale: "en" }

      method = response.parsed_body["data"][0]
      expect(method["name"]).to eq("Standard Delivery")
    end

    it "excludes inactive shipping methods" do
      get "/api/v1/shipping_methods"

      slugs = response.parsed_body["data"].map { |m| m["slug"] }
      expect(slugs).not_to include("inactive")
    end

    it "returns free_threshold as integer or null" do
      get "/api/v1/shipping_methods"

      data = response.parsed_body["data"]
      standard_method = data.find { |m| m["slug"] == "standard" }
      express_method = data.find { |m| m["slug"] == "express" }

      expect(standard_method["free_threshold"]).to eq(5000)
      expect(express_method["free_threshold"]).to be_nil
    end
  end
end
