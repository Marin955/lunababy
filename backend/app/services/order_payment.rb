# Payment outcomes for an order. Both methods lock the order and are
# idempotent, because the Stripe webhook and the customer's return to the
# shop can report the same payment at the same time.
module OrderPayment
  # The payment went through: confirm the order and email the customer.
  def self.complete!(order, payment_intent_id: nil)
    paid_now = false

    order.with_lock do
      next if order.payment_paid?

      order.update!(payment_status: :paid, paid_at: Time.current,
                    stripe_payment_intent_id: payment_intent_id || order.stripe_payment_intent_id)

      if order.pending?
        order.update!(status: :confirmed)
        order.order_status_transitions.create!(from_status: :pending, to_status: :confirmed, note: "Payment received")
      else
        # Paid after the order was released (should not happen: expired sessions cannot be paid).
        Rails.logger.error("[OrderPayment] payment received for #{order.status} order #{order.order_number}")
      end
      paid_now = true
    end

    OrderNotifications.order_placed(order) if paid_now
    order
  end

  # The customer did not pay: cancel the order and put its stock and promo code use back.
  def self.release!(order, reason: "Payment not completed")
    order.with_lock do
      next unless order.pending? && order.payment_unpaid?

      restore_stock!(order)
      order.promo_code&.decrement!(:current_use_count) if order.promo_code&.current_use_count.to_i.positive?
      order.update!(status: :cancelled, payment_status: :expired, cancellation_reason: reason)
      order.order_status_transitions.create!(from_status: :pending, to_status: :cancelled, note: reason)
    end
    order
  end

  def self.restore_stock!(order)
    items = order.order_items.includes(bundle: :bundle_items)
    needed = Hash.new(0)
    items.each do |item|
      item.bundle&.bundle_items&.each { |bi| needed[bi.product_id] += bi.quantity * item.quantity }
    end

    Product.lock.where(id: needed.keys).order(:id).each do |product|
      product.update!(stock_quantity: product.stock_quantity + needed[product.id])
    end
  end
  private_class_method :restore_stock!
end
