class Rack::Attack
  # Throttle all requests by IP (300 requests per 5 minutes)
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Throttle login attempts by IP (5 attempts per minute)
  throttle("auth/ip", limit: 5, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api/v1/auth") && req.post?
  end

  # Throttle order creation by IP (10 per hour)
  throttle("orders/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/orders" && req.post?
  end

  # Throttle promo code validation (20 per minute per IP)
  throttle("promo/ip", limit: 20, period: 1.minute) do |req|
    req.ip if req.path == "/api/v1/promo_codes/validate" && req.post?
  end

  # Throttle newsletter subscription (3 per hour per IP)
  throttle("newsletter/ip", limit: 3, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/newsletter/subscribe" && req.post?
  end

  # Return JSON for throttled requests
  self.throttled_responder = lambda do |_request|
    [ 429, { "Content-Type" => "application/json" }, [ '{"error":"Too many requests. Please try again later."}' ] ]
  end
end
