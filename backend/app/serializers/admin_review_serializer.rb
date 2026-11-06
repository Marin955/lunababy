class AdminReviewSerializer
  include Alba::Resource

  attributes :id, :rating, :title, :body, :author_display_name, :locale, :status,
             :submitted_at, :approved_at, :created_at

  attribute :order_number do |review|
    review.order.order_number
  end

  attribute :customer_email do |review|
    review.order.customer_email
  end

  attribute :bundle do |review|
    { id: review.bundle.id, slug: review.bundle.slug, name: review.bundle.name_hr }
  end
end
