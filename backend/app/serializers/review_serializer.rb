# Public shape of an approved review. Never includes order or customer data
# beyond the display name.
class ReviewSerializer
  include Alba::Resource

  attributes :id, :rating, :title, :body, :author_display_name, :locale

  attribute :published_at do |review|
    review.approved_at || review.submitted_at
  end

  attribute :verified_purchase do |_review|
    true
  end
end
