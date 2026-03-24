class ShipmentSerializer
  include Alba::Resource

  attributes :carrier, :tracking_number, :shipped_at, :estimated_delivery_at

  attribute :tracking_url do |shipment|
    shipment.tracking_url
  end
end
