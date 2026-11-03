module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!, only: [ :index ]
      before_action :try_authenticate_user, only: [ :create ]

      def index
        orders = current_user.orders
                             .includes(:order_items, :shipping_method, :promo_code, :shipment)
                             .order(created_at: :desc)

        records, meta = paginate(orders)

        render json: {
          data: records.map { |o| serialize_order(o) },
          meta: meta
        }
      end

      def show
        order = find_order!
        return unless order

        render json: { data: serialize_order(order) }
      end

      def create
        service = OrderCreationService.new(
          params: order_params,
          user: current_user
        )

        order = service.call
        order.reload

        # Nothing to charge (e.g. a 100% promo code with free shipping).
        if order.total.zero?
          OrderPayment.complete!(order)
          return render json: { data: serialize_order(order.reload), checkout_url: nil }, status: :created
        end

        checkout_url = begin
          StripeCheckout.new(order).start!
        rescue StripeCheckout::Error => e
          Rails.logger.error("[Checkout] could not start payment for #{order.order_number}: #{e.message}")
          OrderPayment.release!(order, reason: "Payment could not be started")
          return render json: { error: "Payment could not be started. Please try again." }, status: :bad_gateway
        end

        render json: { data: serialize_order(order), checkout_url: checkout_url }, status: :created
      rescue OrderCreationService::Error => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # The customer's return from Stripe. The session id proves they went
      # through checkout for this order; if the webhook has not arrived yet we
      # ask Stripe directly, so the confirmation page never shows a stale state.
      def confirm_payment
        order = Order.includes(:order_items, :shipping_method, :promo_code, :shipment)
                     .find_by(order_number: params[:order_number])
        session_id = params[:session_id].to_s

        if order.nil? || session_id.blank? || order.stripe_checkout_session_id != session_id
          return render_not_found("Order not found")
        end

        if order.payment_unpaid?
          session = Stripe::Checkout::Session.retrieve(session_id)
          OrderPayment.complete!(order, payment_intent_id: session.payment_intent) if session.payment_status == "paid"
        end

        render json: { data: serialize_order(order.reload) }
      rescue Stripe::StripeError => e
        Rails.logger.error("[Checkout] could not check payment for #{params[:order_number]}: #{e.message}")
        render json: { data: serialize_order(order) }
      end

      # The customer pressed "back" on Stripe. End the Stripe session and put the
      # stock back now rather than holding it for 30 minutes. The order id is a
      # random UUID only the customer's browser knows.
      def abandon
        order = Order.find_by(id: params[:order_id])
        return head :no_content unless order&.pending? && order.payment_unpaid?

        if order.stripe_checkout_session_id.present?
          session = Stripe::Checkout::Session.retrieve(order.stripe_checkout_session_id)
          if session.payment_status == "paid"
            OrderPayment.complete!(order, payment_intent_id: session.payment_intent)
            return head :no_content
          end
          Stripe::Checkout::Session.expire(session.id) if session.status == "open"
        end

        OrderPayment.release!(order, reason: "Customer cancelled payment")
        head :no_content
      rescue ActiveRecord::StatementInvalid
        head :no_content # not a UUID
      rescue Stripe::StripeError => e
        Rails.logger.error("[Checkout] could not cancel payment for order #{params[:order_id]}: #{e.message}")
        head :no_content
      end

      def lookup
        order = Order.includes(:order_items, :shipping_method, :promo_code, :shipment)
                     .find_by(order_number: params[:order_number])

        if order.nil? || order.customer_email.downcase != params[:email]&.downcase
          return render_not_found("Order not found")
        end

        render json: { data: serialize_order(order) }
      end

      private

      include Paginatable

      def find_order!
        order = Order.includes(:order_items, :shipping_method, :promo_code, :shipment)
                     .find_by(order_number: params[:order_number])

        if order.nil?
          render_not_found("Order not found")
          return nil
        end

        if current_user
          unless order.user_id == current_user.id
            render_not_found("Order not found")
            return nil
          end
        else
          unless order.customer_email.downcase == params[:email]&.downcase
            render_not_found("Order not found")
            return nil
          end
        end

        order
      end

      def try_authenticate_user
        token = extract_token
        return unless token

        payload = decode_jwt(token)
        return unless payload

        @current_user = User.find_by(id: payload["user_id"])
      end

      def order_params
        permitted = params.permit(
          :customer_email, :customer_name, :shipping_method_id,
          :promo_code, :language, :note, :save_address,
          shipping_address: [ :first_name, :last_name, :street, :city, :postal_code, :phone, :company ],
          items: [ :bundle_id, :slug, :quantity ]
        )

        permitted.to_h.deep_symbolize_keys
      end

      def serialize_order(order)
        OrderSerializer.new(order, params: { locale: locale }).serializable_hash
      end
    end
  end
end
