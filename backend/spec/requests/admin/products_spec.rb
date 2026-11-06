require "rails_helper"

RSpec.describe "Admin Products", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:product) { create(:product) }

  describe "GET /admin/products" do
    it "returns empty catalog attributes for a product that has none" do
      get "/admin/products", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"].find { |p| p["id"] == product.id }
      expect(data).to include(
        "brand" => nil, "material_hr" => nil, "material_en" => nil, "dimensions" => nil,
        "age_range_hr" => nil, "age_range_en" => nil, "certifications" => [],
        "care_instructions_hr" => nil, "care_instructions_en" => nil
      )
    end

    it "returns 403 for non-admin" do
      get "/admin/products", headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /admin/products/:id" do
    let(:attributes) do
      {
        brand: "  Acme  ",
        material_hr: "Silikon",
        material_en: "Silicone",
        dimensions: "10 × 5 cm",
        age_range_hr: "0+ mjeseci",
        age_range_en: "0+ months",
        certifications: [ "CE", " EN 71-3 ", "", "CE" ],
        care_instructions_hr: "Prati ručno",
        care_instructions_en: "Hand wash"
      }
    end

    it "updates catalog attributes and normalizes them" do
      patch "/admin/products/#{product.id}", params: { product: attributes }, headers: auth_headers(admin), as: :json

      expect(response).to have_http_status(:ok)
      data = response.parsed_body["data"]
      expect(data["brand"]).to eq("Acme")
      expect(data["material_en"]).to eq("Silicone")
      expect(data["certifications"]).to eq([ "CE", "EN 71-3" ])

      product.reload
      expect(product.age_range_hr).to eq("0+ mjeseci")
      expect(product.care_instructions_en).to eq("Hand wash")
    end

    it "clears attributes when blank values are sent" do
      product.update!(brand: "Acme", certifications: [ "CE" ])

      patch "/admin/products/#{product.id}",
            params: { product: { brand: "  ", certifications: [] } },
            headers: auth_headers(admin), as: :json

      expect(response).to have_http_status(:ok)
      product.reload
      expect(product.brand).to be_nil
      expect(product.certifications).to eq([])
    end

    it "writes an audit log entry" do
      expect {
        patch "/admin/products/#{product.id}", params: { product: attributes }, headers: auth_headers(admin), as: :json
      }.to change(AdminAuditLog, :count).by(1)
    end

    it "returns 403 for non-admin" do
      patch "/admin/products/#{product.id}", params: { product: attributes }, headers: auth_headers(customer), as: :json

      expect(response).to have_http_status(:forbidden)
      expect(product.reload.brand).to be_nil
    end
  end
end
