FactoryBot.define do
  factory :bundle_item do
    bundle
    sequence(:name_hr) { |n| "Stavka #{n}" }
    sequence(:name_en) { |n| "Item #{n}" }
    description_hr { "Opis stavke" }
    description_en { "Item description" }
    quantity { 1 }
    sequence(:position) { |n| n }
  end
end
