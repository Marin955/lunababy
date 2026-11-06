module Api
  module V1
    # Public review endpoints.
    #   GET  /api/v1/bundles/:bundle_slug/reviews  approved reviews + summary
    #   GET  /api/v1/reviews/:token                review form context (token link)
    #   POST /api/v1/reviews/:token                submit the review (single use)
    class ReviewsController < ApplicationController
      DEFAULT_PER = 5
      MAX_PER = 20

      def index
        bundle = Bundle.active.find_by!(slug: params[:bundle_slug])
        scope = Review.published.where(bundle: bundle).newest_first
        summary = Review.summary_for(bundle)
        per = params.fetch(:per, DEFAULT_PER).to_i.clamp(1, MAX_PER)
        page = [ params.fetch(:page, 1).to_i, 1 ].max
        reviews = scope.offset((page - 1) * per).limit(per)

        render json: {
          data: reviews.map { |r| ReviewSerializer.new(r).serializable_hash },
          meta: {
            average_rating: summary[:average_rating],
            total_count: summary[:count],
            current_page: page,
            total_pages: (summary[:count].to_f / per).ceil
          }
        }
      rescue ActiveRecord::RecordNotFound
        render_not_found("Bundle not found")
      end

      def show
        review = find_by_token
        return unless review
        return unless token_open?(review)

        render json: { data: form_context(review) }
      end

      def create
        review = find_by_token
        return unless review

        review.with_lock do
          next unless token_open?(review)

          unless ActiveModel::Type::Boolean.new.cast(params[:consent])
            next render json: { errors: { consent: [ "must be accepted" ] } }, status: :unprocessable_entity
          end

          if review.submit(rating: params[:rating], title: params[:title], body: params[:body], locale: params[:locale])
            render json: { data: { status: review.status } }, status: :created
          else
            render_validation_errors(review)
          end
        end
      end

      private

      def find_by_token
        review = Review.includes(:bundle).find_by(token: params[:token].to_s)
        render_not_found("Review link not found") unless review
        review
      end

      # Renders 410 and returns false when the link was used or has expired.
      def token_open?(review)
        state = review.token_state
        return true if state == :open

        message = state == :used ? "This review link was already used" : "This review link has expired"
        render json: { error: message, code: state.to_s }, status: :gone
        false
      end

      def form_context(review)
        bundle = review.bundle
        {
          bundle: {
            slug: bundle.slug,
            name: locale == "en" ? bundle.name_en : bundle.name_hr,
            emoji: bundle.emoji
          },
          author_display_name: review.author_display_name,
          locale: review.locale,
          expires_at: review.token_expires_at,
          limits: { title_max: Review::TITLE_MAX, body_min: Review::BODY_MIN, body_max: Review::BODY_MAX }
        }
      end
    end
  end
end
