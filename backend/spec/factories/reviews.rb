# Test-only data. Never seed reviews: every review shown on the site must come
# from a real customer through the token link.
FactoryBot.define do
  factory :review do
    association :order, status: :delivered
    bundle
    author_display_name { "Ana K." }
    locale { "hr" }
    token_expires_at { Review::TOKEN_TTL.from_now }

    trait :submitted do
      rating { 5 }
      title { "Odličan paket" }
      body { "Sve stvari su kvalitetne i korisne od prvog dana." }
      submitted_at { 1.day.ago }
    end

    trait :approved do
      submitted
      status { :approved }
      approved_at { 1.hour.ago }
    end

    trait :rejected do
      submitted
      status { :rejected }
    end

    trait :expired do
      token_expires_at { 1.minute.ago }
    end
  end
end
