module Authenticatable
  extend ActiveSupport::Concern

  private

  def authenticate_user!
    token = extract_token
    return render_unauthorized("Missing authorization token") unless token

    payload = decode_jwt(token)
    return render_unauthorized("Invalid or expired token") unless payload

    @current_user = User.find_by(id: payload["user_id"])
    return render_unauthorized("User not found") unless @current_user
  end

  def current_user
    return @current_user if defined?(@current_user)

    token = extract_token
    return nil unless token

    payload = decode_jwt(token)
    return nil unless payload

    @current_user = User.find_by(id: payload["user_id"])
  end

  def extract_token
    header = request.headers["Authorization"]
    header&.split(" ")&.last
  end

  def decode_jwt(token)
    JWT.decode(token, jwt_secret, true, algorithm: "HS256").first
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end

  def encode_jwt(user)
    payload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      exp: 15.minutes.from_now.to_i
    }
    JWT.encode(payload, jwt_secret, "HS256")
  end

  def encode_refresh_token(user)
    payload = {
      user_id: user.id,
      type: "refresh",
      exp: 30.days.from_now.to_i
    }
    JWT.encode(payload, jwt_secret, "HS256")
  end

  def jwt_secret
    ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }
  end

  def render_unauthorized(message = "Unauthorized")
    render json: { error: message }, status: :unauthorized
  end
end
