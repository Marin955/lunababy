module Admin
  # Moderation of submitted reviews. Requests that haven't been answered yet
  # (no submitted_at) are not listed.
  class ReviewsController < BaseController
    def index
      scope = Review.submitted.includes(:order, :bundle).order(submitted_at: :desc)
      scope = scope.where(status: params[:status]) if Review.statuses.key?(params[:status])

      reviews, meta = paginate(scope)
      render json: {
        data: reviews.map { |r| AdminReviewSerializer.new(r).serializable_hash },
        meta: meta.merge(counts: Review.submitted.group(:status).count)
      }
    end

    def approve
      moderate(:approve!, "review.approved")
    end

    def reject
      moderate(:reject!, "review.rejected")
    end

    private

    def moderate(action, audit_action)
      review = Review.submitted.includes(:order, :bundle).find(params[:id])
      old_status = review.status
      review.public_send(action)
      audit_log!(action: audit_action, target: review, changes: { from: old_status, to: review.status })

      render json: { data: AdminReviewSerializer.new(review).serializable_hash }
    rescue ActiveRecord::RecordNotFound
      render_not_found("Review not found")
    end
  end
end
