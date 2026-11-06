# Emails a delivered order's customer one review link per bundle, in the
# order's language. Idempotent: bundles that already have a review row for this
# order are skipped, so a retried or duplicate job never sends twice.
class ReviewRequestJob < ApplicationJob
  queue_as :default

  def perform(order_id)
    order = Order.find_by(id: order_id)
    return unless order&.delivered?

    bundle_ids = order.order_items.distinct.pluck(:bundle_id)
    already_requested = Review.where(order: order).pluck(:bundle_id)
    bundles = Bundle.active.where(id: bundle_ids - already_requested).order(:position).to_a
    return if bundles.empty?

    # Rows and email together: if the email fails, no tokens are left behind and
    # the job can retry cleanly.
    Review.transaction do
      reviews = bundles.map { |bundle| Review.build_request(order, bundle).tap(&:save!) }
      ReviewMailer.request_review(order, reviews).deliver_now
    end
  rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
    # A concurrent job got there first.
    Rails.logger.info("[ReviewRequestJob] skipped order #{order_id}: #{e.message}")
  end
end
