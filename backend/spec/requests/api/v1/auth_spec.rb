require "rails_helper"

RSpec.describe "API V1 Auth", type: :request do
  describe "DELETE /api/v1/auth/session" do
    it "returns success when authenticated" do
      user = create(:user)

      delete "/api/v1/auth/session", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to include("Logged out")
    end

    it "returns 401 without auth token" do
      delete "/api/v1/auth/session"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  # Note: Google and Facebook OAuth endpoints call external APIs,
  # so we test the rejection path (invalid token) without mocking external services.
  describe "POST /api/v1/auth/google" do
    it "rejects an invalid Google token" do
      stub_request(:get, /oauth2.googleapis.com/).to_return(status: 401, body: "{}")

      post "/api/v1/auth/google", params: { credential: "invalid-token" }

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to include("Invalid Google token")
    end
  end

  describe "POST /api/v1/auth/facebook" do
    it "rejects an invalid Facebook token" do
      stub_request(:get, /graph.facebook.com/).to_return(status: 401, body: "{}")

      post "/api/v1/auth/facebook", params: { access_token: "invalid-token" }

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to include("Invalid Facebook token")
    end
  end
end
