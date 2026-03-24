class OrderMailer < ApplicationMailer
  def confirmation(order)
    @order = order
    @locale = order.language || "hr"
    subject = @locale == "en" ? "Order Confirmation #{order.order_number}" : "Potvrda narudžbe #{order.order_number}"
    mail(to: order.customer_email, subject: subject)
  end

  def status_update(order)
    @order = order
    @locale = order.language || "hr"
    status_label = I18n.t("order_status.#{order.status}", locale: @locale, default: order.status.humanize)
    subject = @locale == "en" ? "Order #{order.order_number} - #{status_label}" : "Narudžba #{order.order_number} - #{status_label}"
    mail(to: order.customer_email, subject: subject)
  end

  def shipped(order)
    @order = order
    @shipment = order.shipment
    @locale = order.language || "hr"
    subject = @locale == "en" ? "Your order #{order.order_number} has been shipped!" : "Vaša narudžba #{order.order_number} je poslana!"
    mail(to: order.customer_email, subject: subject)
  end
end
