# Decides which delivered orders get a review request email, and when.
module ReviewRequests
  DEFAULT_DELAY_DAYS = 7
  # Orders delivered longer ago than delay + this window are not asked any more,
  # so a missed run (or turning the feature on) doesn't email old customers.
  CATCH_UP_WINDOW = 14.days

  # Days between delivery and the review request. ENV REVIEW_REQUEST_DELAY_DAYS.
  def self.delay
    days = Integer(ENV.fetch("REVIEW_REQUEST_DELAY_DAYS", DEFAULT_DELAY_DAYS), exception: false)
    (days && days >= 0 ? days : DEFAULT_DELAY_DAYS).days
  end

  # Delivered orders whose delivery is at least `delay` old (but inside the
  # catch-up window) and that haven't been sent a request yet.
  def self.due_orders(now: Time.current)
    latest = now - delay
    earliest = latest - CATCH_UP_WINDOW
    delivered_ids = OrderStatusTransition.to_status_delivered
                                         .where(created_at: earliest..latest)
                                         .select(:order_id)

    Order.delivered
         .where(id: delivered_ids)
         .where.not(id: Review.select(:order_id))
  end

  # Link for the review form, in the review's language.
  def self.review_url(review)
    base = ENV.fetch("FRONTEND_URL", "https://www.lunababy.eu").presence || "https://www.lunababy.eu"
    "#{base.chomp('/')}/#{review.locale}/review/#{review.token}/"
  end
end
