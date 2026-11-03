# Request specs never talk to Stripe. Checkout sessions are faked; specs that
# care about Stripe's answer stub the calls themselves.
ENV["STRIPE_SECRET_KEY"] ||= "sk_test_spec"
ENV["STRIPE_WEBHOOK_SECRET"] ||= "whsec_spec"

module StripeHelpers
  def fake_checkout_session(id: "cs_test_#{SecureRandom.hex(6)}", payment_status: "unpaid", status: "open",
                            payment_intent: "pi_test_123")
    Stripe::Checkout::Session.construct_from(
      id: id, url: "https://checkout.stripe.com/c/pay/#{id}",
      payment_status: payment_status, status: status, payment_intent: payment_intent
    )
  end

  def post_stripe_event(type, session_attrs)
    payload = { id: "evt_test", object: "event", type: type, data: { object: { object: "checkout.session" }.merge(session_attrs) } }.to_json
    timestamp = Time.now.to_i
    signature = Stripe::Webhook::Signature.compute_signature(Time.at(timestamp), payload, ENV["STRIPE_WEBHOOK_SECRET"])
    post "/api/v1/stripe/webhooks", params: payload,
         headers: { "Stripe-Signature" => "t=#{timestamp},v1=#{signature}", "CONTENT_TYPE" => "application/json" }
  end
end

RSpec.configure do |config|
  config.include StripeHelpers

  config.before(:each, type: :request) do
    allow(Stripe::Checkout::Session).to receive(:create) { |_params, _opts| fake_checkout_session }
    allow(Stripe::Coupon).to receive(:create) { Stripe::Coupon.construct_from(id: "coupon_test") }
  end
end
