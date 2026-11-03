require "rails_helper"

RSpec.describe "Stripe payments", type: :request do
  include ActiveJob::TestHelper

  let!(:shipping) { create(:shipping_method, slug: "standard", price: 350) }
  let!(:bundle) { create(:bundle, :with_items, price: 3990) }
  let(:product) { bundle.bundle_items.first.product }

  let(:order_params) do
    {
      customer_email: "buyer@example.com",
      customer_name: "Ana Horvat",
      shipping_method_id: shipping.id,
      language: "hr",
      shipping_address: { first_name: "Ana", last_name: "Horvat", street: "Ilica 1", city: "Zagreb", postal_code: "10000" },
      items: [ { bundle_id: bundle.id, quantity: 1 } ]
    }
  end

  def place_order
    post "/api/v1/orders", params: order_params
    Order.find_by!(order_number: response.parsed_body.dig("data", "order_number"))
  end

  describe "placing an order" do
    it "creates a Stripe Checkout session charging the order total and returns its URL" do
      order = place_order

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["checkout_url"]).to start_with("https://checkout.stripe.com/")
      expect(order).to be_pending
      expect(order).to be_payment_unpaid
      expect(order.stripe_checkout_session_id).to start_with("cs_test_")

      expect(Stripe::Checkout::Session).to have_received(:create) do |params, opts|
        expect(params[:line_items].sum { |li| li[:price_data][:unit_amount] * li[:quantity] }).to eq(3990)
        expect(params[:shipping_options].first.dig(:shipping_rate_data, :fixed_amount, :amount)).to eq(350)
        expect(params[:metadata][:order_id]).to eq(order.id)
        expect(params[:locale]).to eq("hr")
        expect(params[:success_url]).to include("/hr/order-confirmation/?order=#{order.order_number}&session_id={CHECKOUT_SESSION_ID}")
        expect(params[:cancel_url]).to include("cancelled_order=#{order.id}")
        expect(params[:success_url]).not_to include("buyer@example.com")
        expect(opts[:idempotency_key]).to eq("checkout-#{order.id}")
      end
    end

    it "does not email the customer until the order is paid" do
      perform_enqueued_jobs { place_order }
      expect(ActionMailer::Base.deliveries).to be_empty
    end

    it "applies the promo discount as a one-off coupon" do
      create(:promo_code, code: "LUNA10", discount_type: :fixed, value: 500)
      post "/api/v1/orders", params: order_params.merge(promo_code: "LUNA10")

      expect(Stripe::Coupon).to have_received(:create).with(hash_including(amount_off: 500, currency: "eur"), anything)
      expect(Stripe::Checkout::Session).to have_received(:create).with(hash_including(discounts: [ { coupon: "coupon_test" } ]), anything)
    end

    it "releases the order and its stock when Stripe cannot start the payment" do
      allow(Stripe::Checkout::Session).to receive(:create).and_raise(Stripe::APIConnectionError, "down")

      expect { post "/api/v1/orders", params: order_params }.not_to change { product.reload.stock_quantity }
      expect(response).to have_http_status(:bad_gateway)
      expect(Order.last).to be_cancelled
    end
  end

  describe "webhook" do
    it "confirms the order and emails the customer when checkout completes" do
      order = place_order

      perform_enqueued_jobs do
        post_stripe_event("checkout.session.completed",
                          id: order.stripe_checkout_session_id, payment_status: "paid", payment_intent: "pi_123")
      end

      expect(response).to have_http_status(:ok)
      order.reload
      expect(order).to be_confirmed
      expect(order).to be_payment_paid
      expect(order.stripe_payment_intent_id).to eq("pi_123")
      expect(order.paid_at).to be_present

      mail = ActionMailer::Base.deliveries.last
      expect(mail.to).to eq([ "buyer@example.com" ])
      expect(mail.subject).to start_with("Potvrda narudžbe LB-")
      expect(mail.reply_to).to eq([ "info@lunababy.eu" ])
    end

    it "sends the confirmation only once when the event is delivered twice" do
      order = place_order

      perform_enqueued_jobs do
        2.times { post_stripe_event("checkout.session.completed", id: order.stripe_checkout_session_id, payment_status: "paid") }
      end

      expect(ActionMailer::Base.deliveries.size).to eq(1)
      expect(order.order_status_transitions.where(to_status: :confirmed).count).to eq(1)
    end

    it "waits when a delayed payment method has not paid yet" do
      order = place_order
      post_stripe_event("checkout.session.completed", id: order.stripe_checkout_session_id, payment_status: "unpaid")

      expect(order.reload).to be_pending
    end

    it "cancels the order and restores stock when the session expires" do
      stock_before = product.stock_quantity
      order = place_order
      expect(product.reload.stock_quantity).to be < stock_before

      post_stripe_event("checkout.session.expired", id: order.stripe_checkout_session_id)

      expect(order.reload).to be_cancelled
      expect(order).to be_payment_expired
      expect(product.reload.stock_quantity).to eq(stock_before)
    end

    it "rejects events with a bad signature" do
      post "/api/v1/stripe/webhooks", params: "{}", headers: { "Stripe-Signature" => "t=1,v1=bad", "CONTENT_TYPE" => "application/json" }
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "returning from Stripe" do
    it "confirms the payment with Stripe when the webhook has not arrived yet" do
      order = place_order
      allow(Stripe::Checkout::Session).to receive(:retrieve)
        .with(order.stripe_checkout_session_id)
        .and_return(fake_checkout_session(id: order.stripe_checkout_session_id, payment_status: "paid", status: "complete"))

      post "/api/v1/orders/#{order.order_number}/confirm_payment", params: { session_id: order.stripe_checkout_session_id }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("data", "payment_status")).to eq("paid")
      expect(order.reload).to be_confirmed
    end

    it "does not reveal the order for a wrong session id" do
      order = place_order
      post "/api/v1/orders/#{order.order_number}/confirm_payment", params: { session_id: "cs_test_other" }
      expect(response).to have_http_status(:not_found)
    end

    it "cancels the order and releases stock when the customer goes back from Stripe" do
      stock_before = product.stock_quantity
      order = place_order
      allow(Stripe::Checkout::Session).to receive(:retrieve)
        .and_return(fake_checkout_session(id: order.stripe_checkout_session_id))
      allow(Stripe::Checkout::Session).to receive(:expire)

      post "/api/v1/orders/abandon", params: { order_id: order.id }

      expect(response).to have_http_status(:no_content)
      expect(Stripe::Checkout::Session).to have_received(:expire).with(order.stripe_checkout_session_id)
      expect(order.reload).to be_cancelled
      expect(product.reload.stock_quantity).to eq(stock_before)
    end

    it "ignores abandon requests for unknown ids" do
      post "/api/v1/orders/abandon", params: { order_id: "not-a-uuid" }
      expect(response).to have_http_status(:no_content)
    end
  end
end
