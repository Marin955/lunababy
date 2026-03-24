FactoryBot.define do
  factory :user do
    name { "Test User" }
    sequence(:email) { |n| "user#{n}@example.com" }
    role { :customer }
    language { :hr }

    trait :admin do
      role { :admin }
    end
  end
end
