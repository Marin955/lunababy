# Runs daily (config/recurring.yml). Enqueues a ReviewRequestJob for every
# order delivered ReviewRequests.delay ago that hasn't been asked yet.
class ScheduleReviewRequestsJob < ApplicationJob
  queue_as :default

  def perform
    ReviewRequests.due_orders.find_each do |order|
      ReviewRequestJob.perform_later(order.id)
    end
  end
end
