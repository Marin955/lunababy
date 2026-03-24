FactoryBot.define do
  factory :shipping_method do
    sequence(:slug) { |n| "shipping-#{n}" }
    name_hr { "Standardna dostava" }
    name_en { "Standard Delivery" }
    carrier { "Test Carrier" }
    description_hr { "Opis dostave" }
    description_en { "Delivery description" }
    price { 350 }
    estimated_days { "3-5" }
    free_threshold { 5000 }
    active { true }
    position { 0 }
  end
end
