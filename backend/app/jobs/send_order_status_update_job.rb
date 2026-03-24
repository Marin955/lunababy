class SendOrderStatusUpdateJob < ApplicationJob
  queue_as :default

  def perform(order_id)
    order = Order.find(order_id)
    if order.shipped? && order.shipment.present?
      OrderMailer.shipped(order).deliver_now
    else
      OrderMailer.status_update(order).deliver_now
    end
  end
end
