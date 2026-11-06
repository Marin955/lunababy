class ReviewMailer < ApplicationMailer
  # One email per order with a link per bundle.
  def request_review(order, reviews)
    @order = order
    @locale = order.language.presence || "hr"
    @links = reviews.map do |review|
      name = @locale == "en" ? review.bundle.name_en : review.bundle.name_hr
      { name: name, url: ReviewRequests.review_url(review) }
    end
    @expires_on = reviews.map(&:token_expires_at).min

    subject = @locale == "en" ? "How do you like your LunaBaby bundle?" : "Kako vam se sviđa vaš LunaBaby paket?"
    mail(to: order.customer_email, subject: subject)
  end
end
