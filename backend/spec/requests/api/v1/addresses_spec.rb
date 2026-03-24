require "rails_helper"

RSpec.describe "API V1 Profile Addresses", type: :request do
  let!(:user) { create(:user) }
  let!(:address) { create(:address, user: user) }

  describe "POST /api/v1/profile/addresses" do
    let(:valid_params) do
      {
        first_name: "Ana",
        last_name: "Horvat",
        street: "Vukovarska 10",
        city: "Split",
        postal_code: "21000",
        phone: "+385912345678"
      }
    end

    it "creates a new address" do
      post "/api/v1/profile/addresses", params: valid_params, headers: auth_headers(user)

      expect(response).to have_http_status(:created)
      json = response.parsed_body["data"]
      expect(json["first_name"]).to eq("Ana")
      expect(json["city"]).to eq("Split")
    end

    it "returns 401 without auth token" do
      post "/api/v1/profile/addresses", params: valid_params

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/profile/addresses/:id" do
    it "updates an existing address" do
      patch "/api/v1/profile/addresses/#{address.id}", params: { city: "Rijeka" }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["city"]).to eq("Rijeka")
    end

    it "returns 404 for another user's address" do
      other_user = create(:user)
      other_address = create(:address, user: other_user)

      patch "/api/v1/profile/addresses/#{other_address.id}", params: { city: "Rijeka" }, headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/profile/addresses/:id" do
    it "deletes an address" do
      delete "/api/v1/profile/addresses/#{address.id}", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to include("deleted")
      expect(user.addresses.count).to eq(0)
    end

    it "returns 404 for another user's address" do
      other_user = create(:user)
      other_address = create(:address, user: other_user)

      delete "/api/v1/profile/addresses/#{other_address.id}", headers: auth_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end
end
