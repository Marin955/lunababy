class OrderItemSerializer
  include Alba::Resource

  attribute :bundle_slug do |item|
    item.bundle.slug
  end

  attribute :bundle_name do |item|
    item.bundle_name
  end

  attributes :quantity, :unit_price, :line_total
end
