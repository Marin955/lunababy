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
        response = Net::HTTP.get_response(
          URI("https://oauth2.googleapis.com/tokeninfo?id_token=#{params[:credential]}")
        )

        unless response.is_a?(Net::HTTPSuccess)
          return render json: { error: "Invalid Google token" }, status: :unauthorized
        end

        payload = JSON.parse(response.body)
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
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      def facebook
        response = Net::HTTP.get_response(
          URI("https://graph.facebook.com/me?fields=id,name,email&access_token=#{params[:access_token]}")
        )

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
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      def destroy
        authenticate_user!
        return if performed?

        render json: { message: "Logged out successfully" }
      end
    end
  end
end
