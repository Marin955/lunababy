require "rails_helper"

RSpec.describe "Admin Promo Codes", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:promo) { create(:promo_code, code: "ADMIN10", discount_type: :percentage, value: 10) }

  describe "GET /admin/promo_codes" do
    it "returns all promo codes for admin" do
      get "/admin/promo_codes", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].length).to eq(1)
      expect(response.parsed_body["data"][0]["code"]).to eq("ADMIN10")
    end

    it "returns 403 for non-admin" do
      get "/admin/promo_codes", headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /admin/promo_codes" do
    it "creates a new promo code" do
      post "/admin/promo_codes",
           params: { code: "NEWCODE", discount_type: "fixed", value: 1500, label_hr: "15 EUR popusta", label_en: "15 EUR off" },
           headers: auth_headers(admin)

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["code"]).to eq("NEWCODE")
      expect(json["discount_type"]).to eq("fixed")
      expect(json["value"]).to eq(1500)
    end

    it "rejects duplicate code" do
      post "/admin/promo_codes",
           params: { code: "ADMIN10", discount_type: "percentage", value: 5 },
           headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 403 for non-admin" do
      post "/admin/promo_codes",
           params: { code: "HACK", discount_type: "percentage", value: 100 },
           headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /admin/promo_codes/:id" do
    it "updates promo code value" do
      patch "/admin/promo_codes/#{promo.id}", params: { value: 20 }, headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(promo.reload.value).to eq(20)
    end

    it "deactivates a promo code" do
      patch "/admin/promo_codes/#{promo.id}", params: { active: false }, headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(promo.reload.active).to be false
    end
  end
end
