module AuthHelpers
  def jwt_for(user)
    payload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      exp: 1.hour.from_now.to_i
    }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end

  def auth_headers(user)
    { "Authorization" => "Bearer #{jwt_for(user)}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
