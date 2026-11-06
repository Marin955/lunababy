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

    context "with product catalog attributes" do
      let(:product) { bundle1.bundle_items.first.product }

      def item_for(product_id)
        response.parsed_body["data"]["items"].find { |i| i["product_id"] == product_id }
      end

      before do
        product.update!(
          brand: "Acme",
          material_hr: "Pamuk", material_en: "Cotton",
          dimensions: "70 × 90 cm",
          age_range_hr: "0–6 mjeseci", age_range_en: "0–6 months",
          certifications: [ "CE", "EN 71-3" ],
          care_instructions_hr: "Prati na 30 °C", care_instructions_en: "Wash at 30 °C"
        )
      end

      it "returns localized specs in HR" do
        get "/api/v1/bundles/sleep-bundle"

        item = item_for(product.id)
        expect(item).to include(
          "brand" => "Acme", "material" => "Pamuk", "dimensions" => "70 × 90 cm",
          "age_range" => "0–6 mjeseci", "certifications" => [ "CE", "EN 71-3" ],
          "care_instructions" => "Prati na 30 °C"
        )
      end

      it "returns localized specs in EN" do
        get "/api/v1/bundles/sleep-bundle", params: { locale: "en" }

        item = item_for(product.id)
        expect(item).to include("material" => "Cotton", "age_range" => "0–6 months", "care_instructions" => "Wash at 30 °C")
      end

      it "returns null specs and empty certifications for products without data" do
        get "/api/v1/bundles/sleep-bundle", params: { locale: "en" }

        other = bundle1.bundle_items.map(&:product_id).find { |id| id != product.id }
        item = item_for(other)
        expect(item).to include(
          "brand" => nil, "material" => nil, "dimensions" => nil,
          "age_range" => nil, "certifications" => [], "care_instructions" => nil
        )
      end
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
