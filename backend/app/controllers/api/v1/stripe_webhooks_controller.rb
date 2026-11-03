module Api
  module V1
    # Receives payment events from Stripe. Configure the endpoint in the Stripe
    # dashboard (Developers → Webhooks) for the events handled below and set
    # STRIPE_WEBHOOK_SECRET to its signing secret.
    class StripeWebhooksController < ActionController::API
      def create
        event = Stripe::Webhook.construct_event(
          request.body.read, request.headers["Stripe-Signature"], ENV.fetch("STRIPE_WEBHOOK_SECRET", "")
        )

        handle(event)
        head :ok
      rescue JSON::ParserError, Stripe::SignatureVerificationError => e
        Rails.logger.warn("[StripeWebhook] rejected: #{e.class}")
        head :bad_request
      end

      private

      def handle(event)
        session = event.data.object

        case event.type
        when "checkout.session.completed", "checkout.session.async_payment_succeeded"
          order = order_for(session)
          OrderPayment.complete!(order, payment_intent_id: session.payment_intent) if order && session.payment_status == "paid"
        when "checkout.session.expired", "checkout.session.async_payment_failed"
          order = order_for(session)
          OrderPayment.release!(order) if order
        else
          Rails.logger.info("[StripeWebhook] ignored #{event.type}")
        end
      end

      def order_for(session)
        order = Order.find_by(stripe_checkout_session_id: session.id)
        Rails.logger.warn("[StripeWebhook] no order for session #{session.id}") unless order
        order
      end
    end
  end
end
