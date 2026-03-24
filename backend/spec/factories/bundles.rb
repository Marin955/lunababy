FactoryBot.define do
  factory :bundle do
    sequence(:slug) { |n| "bundle-#{n}" }
    name_hr { "Testni paket" }
    name_en { "Test Bundle" }
    description_hr { "Opis paketa" }
    description_en { "Bundle description" }
    short_description_hr { "Kratki opis" }
    short_description_en { "Short description" }
    price { 5990 }
    stock_quantity { 10 }
    category { "test" }
    emoji { "🎁" }
    color_from { "teal-light" }
    color_to { "lavender-light" }
    active { true }
    position { 0 }

    trait :with_items do
      after(:create) do |bundle|
        create_list(:bundle_item, 2, bundle: bundle)
      end
    end

    trait :out_of_stock do
      stock_quantity { 0 }
    end

    trait :inactive do
      active { false }
    end

    trait :on_sale do
      badge { :sale }
      original_price { 7990 }
    end
  end
end
