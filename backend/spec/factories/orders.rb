FactoryBot.define do
  factory :order do
    shipping_method
    customer_email { "customer@example.com" }
    customer_name { "John Doe" }
    shipping_first_name { "John" }
    shipping_last_name { "Doe" }
    shipping_street { "Ilica 1" }
    shipping_city { "Zagreb" }
    shipping_postal_code { "10000" }
    subtotal { 8990 }
    shipping_cost { 350 }
    total { 9340 }
    status { :pending }
    language { :hr }

    trait :with_items do
      after(:create) do |order|
        bundle = create(:bundle)
        order.order_items.create!(
          bundle: bundle,
          bundle_name: bundle.name_hr,
          quantity: 1,
          unit_price: bundle.price,
          line_total: bundle.price
        )
      end
    end

    trait :confirmed do
      status { :confirmed }
    end

    trait :shipped do
      status { :shipped }
      after(:create) do |order|
        create(:shipment, order: order)
      end
    end
  end
end
