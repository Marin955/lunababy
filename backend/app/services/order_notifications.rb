# Queues customer emails for an order. Called after the order change has been
# committed; a failure to queue is logged rather than raised, so the customer
# never gets an error for an order or status change that did succeed.
module OrderNotifications
  def self.order_placed(order)
    enqueue { SendOrderConfirmationJob.perform_later(order.id) }
  end

  # Sends the "shipped" email when the order has a shipment, otherwise a status update.
  def self.status_changed(order)
    enqueue { SendOrderStatusUpdateJob.perform_later(order.id) }
  end

  def self.enqueue
    yield
  rescue StandardError => e
    Rails.logger.error("[OrderNotifications] could not queue email: #{e.class}: #{e.message}")
    nil
  end
  private_class_method :enqueue
end
