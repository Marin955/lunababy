FactoryBot.define do
  factory :shipment do
    order
    carrier { :gls }
    tracking_number { "GLS123456789" }
    shipped_at { Time.current }
    estimated_delivery_at { 3.days.from_now.to_date }
  end
end
