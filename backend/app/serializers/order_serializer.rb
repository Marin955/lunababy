class OrderSerializer
  include Alba::Resource

  attributes :id, :order_number, :status, :payment_status, :paid_at, :customer_email, :customer_name,
             :subtotal, :discount_amount, :shipping_cost, :total,
             :language, :note, :created_at, :terms_accepted_at

  attribute :pickup_point do |order|
    next nil unless order.pickup_point?

    {
      provider: order.pickup_point_provider,
      id: order.pickup_point_id,
      name: order.pickup_point_name,
      address: order.pickup_point_address
    }
  end

  attribute :shipping_address do |order|
    {
      first_name: order.shipping_first_name,
      last_name: order.shipping_last_name,
      street: order.shipping_street,
      city: order.shipping_city,
      postal_code: order.shipping_postal_code,
      phone: order.shipping_phone,
      company: order.shipping_company
    }
  end

  attribute :items do |order|
    order.order_items.map do |item|
      OrderItemSerializer.new(item).serializable_hash
    end
  end

  attribute :shipping_method do |order|
    sm = order.shipping_method
    locale = params[:locale]
    {
      slug: sm.slug,
      name: locale == "en" ? sm.name_en : sm.name_hr,
      price: sm.price,
      requires_pickup_point: sm.requires_pickup_point
    }
  end

  attribute :promo_code do |order|
    pc = order.promo_code
    next nil unless pc

    {
      code: pc.code,
      discount_type: pc.discount_type,
      value: pc.value
    }
  end

  attribute :shipment do |order|
    next nil unless order.shipment

    ShipmentSerializer.new(order.shipment).serializable_hash
  end
end
