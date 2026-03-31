require "rails_helper"

RSpec.describe "API V1 Bundles", type: :request do
  let!(:bundle1) { create(:bundle, :with_items, slug: "sleep-bundle", name_hr: "Paket za spavanje", name_en: "Sleep Bundle", position: 0, badge: :popular) }
  let!(:bundle2) { create(:bundle, :on_sale, slug: "feeding-bundle", name_hr: "Paket za hranjenje", name_en: "Feeding Bundle", position: 1) }
  let!(:inactive_bundle) { create(:bundle, :inactive, slug: "hidden-bundle") }

  describe "GET /api/v1/bundles" do
    it "returns all active bundles in HR locale by default" do
      get "/api/v1/bundles"

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"].length).to eq(2)
      expect(json["data"][0]["slug"]).to eq("sleep-bundle")
      expect(json["data"][0]["name"]).to eq("Paket za spavanje")
      expect(json["data"][0]["price"]).to be_a(Integer)
      expect(json["data"][0]["in_stock"]).to be true
    end

    it "returns bundles in EN locale when requested" do
      get "/api/v1/bundles", params: { locale: "en" }

      json = response.parsed_body
      expect(json["data"][0]["name"]).to eq("Sleep Bundle")
    end

    it "excludes inactive bundles" do
      get "/api/v1/bundles"

      slugs = response.parsed_body["data"].map { |b| b["slug"] }
      expect(slugs).not_to include("hidden-bundle")
    end

    it "returns expected fields for each bundle" do
      get "/api/v1/bundles"

      bundle = response.parsed_body["data"][0]
      expect(bundle).to include(
        "id", "slug", "name", "short_description", "price",
        "original_price", "badge", "category", "emoji",
        "color_from", "color_to", "in_stock"
      )
      expect(bundle).not_to include("description", "items")
    end

    it "returns badge and original_price for sale bundles" do
      get "/api/v1/bundles"

      sale_bundle = response.parsed_body["data"].find { |b| b["slug"] == "feeding-bundle" }
      expect(sale_bundle["badge"]).to eq("sale")
      expect(sale_bundle["original_price"]).to eq(7990)
    end
  end

  describe "GET /api/v1/bundles/:slug" do
    it "returns bundle detail with items" do
      get "/api/v1/bundles/sleep-bundle"

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["slug"]).to eq("sleep-bundle")
      expect(json["description"]).to be_present
      expect(json["items"]).to be_an(Array)
      expect(json["items"].length).to eq(2)
      expect(json["items"][0]).to include("name", "description", "quantity")
    end

    it "returns items in EN locale" do
      get "/api/v1/bundles/sleep-bundle", params: { locale: "en" }

      json = response.parsed_body["data"]
      expect(json["name"]).to eq("Sleep Bundle")
      expect(json["items"][0]["name"]).to start_with("Product")
    end

    it "returns 404 for nonexistent bundle" do
      get "/api/v1/bundles/nonexistent"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Bundle not found")
    end

    it "returns 404 for inactive bundle" do
      get "/api/v1/bundles/hidden-bundle"

      expect(response).to have_http_status(:not_found)
    end
  end
end
