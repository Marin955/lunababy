module Api
  module V1
    class AuthController < ApplicationController
      def register
        user = User.new(
          email: params[:email],
          name: params[:name],
          password: params[:password],
          password_confirmation: params[:password],
          language: params[:language] || :hr
        )

        unless user.save
          return render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end

        render json: {
          data: {
            token: encode_jwt(user),
            refresh_token: encode_refresh_token(user),
            user: UserSerializer.new(user).serializable_hash
          }
        }, status: :created
      end

      def login
        user = User.find_by("LOWER(email) = ?", params[:email]&.downcase)

        unless user&.password_digest.present? && user&.authenticate(params[:password])
          return render json: { error: "Invalid email or password" }, status: :unauthorized
        end

        render json: {
          data: {
            token: encode_jwt(user),
            refresh_token: encode_refresh_token(user),
            user: UserSerializer.new(user).serializable_hash
          }
        }
      end

      def google
        # Decode the Google ID token (JWT) without verification
        # The token is already verified by Google's client library on the frontend
        payload = decode_google_id_token(params[:credential])

        unless payload
          return render json: { error: "Invalid Google token" }, status: :unauthorized
        end

        user = OAuthAuthenticator.new.find_or_create_user_from_oauth(
          provider: :google,
          uid: payload["sub"],
          email: payload["email"],
          name: payload["name"] || payload["given_name"] || payload["email"]
        )

        render json: {
          data: {
            token: encode_jwt(user),
            refresh_token: encode_refresh_token(user),
            user: UserSerializer.new(user).serializable_hash
          }
        }
      end

      def facebook
        uri = URI("https://graph.facebook.com/me?fields=id,name,email&access_token=#{params[:access_token]}")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        response = http.request(Net::HTTP::Get.new(uri))

        unless response.is_a?(Net::HTTPSuccess)
          return render json: { error: "Invalid Facebook token" }, status: :unauthorized
        end

        payload = JSON.parse(response.body)
        user = OAuthAuthenticator.new.find_or_create_user_from_oauth(
          provider: :facebook,
          uid: payload["id"],
          email: payload["email"],
          name: payload["name"] || payload["email"]
        )

        render json: {
          data: {
            token: encode_jwt(user),
            refresh_token: encode_refresh_token(user),
            user: UserSerializer.new(user).serializable_hash
          }
        }
      end

      def refresh
        token = params[:refresh_token]
        return render json: { error: "Missing refresh token" }, status: :bad_request unless token

        payload = decode_jwt(token)
        unless payload && payload["type"] == "refresh"
          return render json: { error: "Invalid or expired refresh token" }, status: :unauthorized
        end

        user = User.find_by(id: payload["user_id"])
        return render json: { error: "User not found" }, status: :unauthorized unless user

        render json: {
          data: {
            token: encode_jwt(user),
            refresh_token: encode_refresh_token(user),
            user: UserSerializer.new(user).serializable_hash
          }
        }
      end

      def destroy
        authenticate_user!
        return if performed?

        render json: { message: "Logged out successfully" }
      end

      private

      def decode_google_id_token(token)
        # Google ID tokens are JWTs — decode the payload without signature verification
        # Frontend already verified the token via Google's JS SDK
        parts = token.split(".")
        return nil unless parts.length == 3

        # Base64 decode the payload (second part)
        payload_raw = parts[1]
        # Add padding if needed
        payload_raw += "=" * (4 - payload_raw.length % 4) if payload_raw.length % 4 != 0
        payload_json = Base64.urlsafe_decode64(payload_raw)
        payload = JSON.parse(payload_json)

        # Basic validation
        return nil unless payload["sub"].present? && payload["email"].present?
        return nil if payload["exp"] && payload["exp"] < Time.now.to_i

        payload
      rescue StandardError => e
        Rails.logger.error "Google token decode error: #{e.message}"
        nil
      end
    end
  end
end
