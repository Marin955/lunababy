# Starts a hosted Stripe Checkout payment for an order that was just created
# (stock already reserved, status pending). The customer pays on Stripe and is
# sent back to the order confirmation page; OrderPayment then marks the order
# paid (from the webhook or the return page, whichever comes first).
class StripeCheckout
  class Error < StandardError; end

  # Stripe's minimum session lifetime is 30 minutes. Unpaid orders keep their
  # stock reserved until the session expires.
  SESSION_LIFETIME = 31.minutes
  CURRENCY = "eur".freeze

  def self.configured?
    ENV["STRIPE_SECRET_KEY"].present?
  end

  def self.frontend_url
    ENV.fetch("FRONTEND_URL", "https://www.lunababy.eu").chomp("/")
  end

  def initialize(order)
    @order = order
  end

  # Returns the URL to redirect the customer to.
  def start!
    raise Error, "Payments are not configured" unless self.class.configured?

    session = Stripe::Checkout::Session.create(session_params, { idempotency_key: "checkout-#{order.id}" })
    order.update!(stripe_checkout_session_id: session.id)
    session.url
  rescue Stripe::StripeError => e
    raise Error, e.message
  end

  private

  attr_reader :order

  def session_params
    params = {
      mode: "payment",
      locale: order.language,
      customer_email: order.customer_email,
      client_reference_id: order.order_number,
      metadata: metadata,
      payment_intent_data: { metadata: metadata, description: "LunaBaby #{order.order_number}" },
      line_items: line_items,
      shipping_options: [ shipping_option ],
      expires_at: SESSION_LIFETIME.from_now.to_i,
      success_url: "#{base_url}/order-confirmation/?order=#{order.order_number}&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "#{base_url}/checkout/?cancelled_order=#{order.id}"
    }
    params[:discounts] = [ { coupon: discount_coupon.id } ] if order.discount_amount.positive?
    params
  end

  def base_url
    "#{self.class.frontend_url}/#{order.language}"
  end

  def metadata
    data = { order_id: order.id, order_number: order.order_number }
    if order.pickup_point?
      # Stripe metadata values are limited to 500 characters.
      data[:pickup_point_provider] = order.pickup_point_provider
      data[:pickup_point_id] = order.pickup_point_id.truncate(500)
      data[:pickup_point_name] = order.pickup_point_name.truncate(500)
      data[:pickup_point_address] = order.pickup_point_address.truncate(500) if order.pickup_point_address.present?
    end
    data
  end

  def line_items
    order.order_items.map do |item|
      {
        quantity: item.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: item.unit_price,
          product_data: { name: item.bundle_name }
        }
      }
    end
  end

  def shipping_option
    name = order.en? ? order.shipping_method.name_en : order.shipping_method.name_hr
    {
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: name,
        fixed_amount: { amount: order.shipping_cost, currency: CURRENCY }
      }
    }
  end

  # The order's discount was already computed by OrderCreationService; a
  # one-off coupon makes Stripe charge exactly order.total.
  def discount_coupon
    Stripe::Coupon.create(
      { amount_off: order.discount_amount, currency: CURRENCY, duration: "once", max_redemptions: 1,
        name: order.promo_code&.code || "Popust" },
      { idempotency_key: "coupon-#{order.id}" }
    )
  end
end
