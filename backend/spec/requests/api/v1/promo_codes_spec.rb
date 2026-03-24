require "rails_helper"

RSpec.describe "API V1 Promo Codes", type: :request do
  let!(:percentage_promo) { create(:promo_code, code: "LUNA10", discount_type: :percentage, value: 10) }
  let!(:fixed_promo) { create(:promo_code, :fixed, code: "BEBA20") }
  let!(:free_ship_promo) { create(:promo_code, :free_shipping, code: "FREESHIP") }
  let!(:expired_promo) { create(:promo_code, :expired, code: "EXPIRED") }
  let!(:inactive_promo) { create(:promo_code, :inactive, code: "INACTIVE") }
  let!(:maxed_promo) { create(:promo_code, :maxed_out, code: "MAXED") }

  describe "POST /api/v1/promo_codes/validate" do
    it "validates a percentage promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "LUNA10", cart_total: 8990 }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["valid"]).to be true
      expect(json["code"]).to eq("LUNA10")
      expect(json["discount_type"]).to eq("percentage")
      expect(json["value"]).to eq(10)
      expect(json["discount_amount"]).to eq(899)
      expect(json["label"]).to be_present
    end

    it "validates a fixed discount promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "BEBA20", cart_total: 8990 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be true
      expect(json["discount_amount"]).to eq(2000)
    end

    it "validates a free shipping promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "FREESHIP", cart_total: 1000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be true
      expect(json["discount_type"]).to eq("free_shipping")
      expect(json["discount_amount"]).to eq(0)
    end

    it "is case-insensitive for code lookup" do
      post "/api/v1/promo_codes/validate", params: { code: "luna10", cart_total: 5000 }

      expect(response.parsed_body["data"]["valid"]).to be true
    end

    it "rejects an expired promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "EXPIRED", cart_total: 5000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be false
      expect(json["reason"]).to include("expired")
    end

    it "rejects an inactive promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "INACTIVE", cart_total: 5000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be false
      expect(json["reason"]).to include("not active")
    end

    it "rejects a maxed-out promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "MAXED", cart_total: 5000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be false
      expect(json["reason"]).to include("usage limit")
    end

    it "rejects when cart total below minimum" do
      post "/api/v1/promo_codes/validate", params: { code: "BEBA20", cart_total: 2000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be false
      expect(json["reason"]).to include("Minimum order")
    end

    it "rejects a nonexistent promo code" do
      post "/api/v1/promo_codes/validate", params: { code: "DOESNOTEXIST", cart_total: 5000 }

      json = response.parsed_body["data"]
      expect(json["valid"]).to be false
      expect(json["reason"]).to include("not found")
    end

    it "returns label in EN locale" do
      post "/api/v1/promo_codes/validate", params: { code: "LUNA10", cart_total: 5000, locale: "en" }

      json = response.parsed_body["data"]
      expect(json["label"]).to eq("10% off")
    end
  end
end
