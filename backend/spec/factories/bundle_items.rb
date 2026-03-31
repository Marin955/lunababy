FactoryBot.define do
  factory :bundle_item do
    bundle
    product
    quantity { 1 }
    sequence(:position) { |n| n }
  end
end
