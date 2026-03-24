module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!, only: [:index]
      before_action :try_authenticate_user, only: [:create]

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

        render json: { data: serialize_order(order) }, status: :created
      rescue OrderCreationService::Error => e
        render json: { error: e.message }, status: :unprocessable_entity
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
          shipping_address: [:first_name, :last_name, :street, :city, :postal_code, :phone, :company],
          items: [:bundle_id, :slug, :quantity]
        )

        permitted.to_h.deep_symbolize_keys
      end

      def serialize_order(order)
        OrderSerializer.new(order, params: { locale: locale }).serializable_hash
      end
    end
  end
end
