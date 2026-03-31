FactoryBot.define do
  factory :product do
    sequence(:name_hr) { |n| "Proizvod #{n}" }
    sequence(:name_en) { |n| "Product #{n}" }
    description_hr { "Opis proizvoda" }
    description_en { "Product description" }
    sex { :unisex }
    purchase_price { 1000 }
    purchase_price_with_vat { 1250 }
    msrp { 1990 }
    stock_quantity { 100 }
    low_stock_threshold { 5 }
    active { true }
    position { 0 }

    trait :low_stock do
      stock_quantity { 3 }
    end

    trait :out_of_stock do
      stock_quantity { 0 }
    end
  end
end
