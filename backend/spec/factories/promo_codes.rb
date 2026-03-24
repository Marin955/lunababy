FactoryBot.define do
  factory :promo_code do
    sequence(:code) { |n| "PROMO#{n}" }
    discount_type { :percentage }
    value { 10 }
    label_hr { "10% popusta" }
    label_en { "10% off" }
    active { true }

    trait :fixed do
      discount_type { :fixed }
      value { 2000 }
      min_order_amount { 5000 }
      label_hr { "20€ popusta" }
      label_en { "20€ off" }
    end

    trait :free_shipping do
      discount_type { :free_shipping }
      value { 0 }
      label_hr { "Besplatna dostava" }
      label_en { "Free shipping" }
    end

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :inactive do
      active { false }
    end

    trait :maxed_out do
      max_uses { 1 }
      current_use_count { 1 }
    end
  end
end
