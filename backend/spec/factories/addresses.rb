FactoryBot.define do
  factory :address do
    user
    first_name { "John" }
    last_name { "Doe" }
    street { "Ilica 1" }
    city { "Zagreb" }
    postal_code { "10000" }
    phone { "+385911234567" }
  end
end
