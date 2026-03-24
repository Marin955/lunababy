require "rails_helper"

RSpec.describe "API V1 Profile", type: :request do
  let!(:user) { create(:user, name: "Jane Doe", phone: "+385911111111") }

  describe "GET /api/v1/profile" do
    it "returns the current user profile" do
      get "/api/v1/profile", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["name"]).to eq("Jane Doe")
      expect(json["email"]).to eq(user.email)
    end

    it "returns 401 without auth token" do
      get "/api/v1/profile"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/profile" do
    it "updates the user name" do
      patch "/api/v1/profile", params: { name: "Updated Name" }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]["name"]).to eq("Updated Name")
      expect(user.reload.name).to eq("Updated Name")
    end

    it "updates the user phone" do
      patch "/api/v1/profile", params: { phone: "+385999999999" }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(user.reload.phone).to eq("+385999999999")
    end

    it "updates the user language" do
      patch "/api/v1/profile", params: { language: "en" }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(user.reload.language).to eq("en")
    end

    it "returns 401 without auth token" do
      patch "/api/v1/profile", params: { name: "Hacker" }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
