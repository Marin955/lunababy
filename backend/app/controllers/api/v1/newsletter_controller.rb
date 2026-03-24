module Api
  module V1
    class NewsletterController < ApplicationController
      def subscribe
        subscriber = NewsletterSubscriber.find_or_initialize_by(email: params[:email]&.downcase)

        subscriber.language = params[:language] if params[:language].present?
        subscriber.active = true
        subscriber.subscribed_at = Time.current unless subscriber.persisted? && subscriber.subscribed_at.present?

        if subscriber.save
          render json: { message: "Successfully subscribed to the newsletter" }, status: :ok
        else
          render_validation_errors(subscriber)
        end
      end
    end
  end
end
