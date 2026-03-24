module Admin
  class OrdersController < BaseController
    VALID_TRANSITIONS = {
      "pending" => %w[confirmed cancelled],
      "confirmed" => %w[processing cancelled],
      "processing" => %w[shipped],
      "shipped" => %w[delivered],
      "delivered" => [],
      "cancelled" => [],
      "refunded" => []
    }.freeze

    def index
      scope = Order.includes(:order_items, :shipment).order(created_at: :desc)
      scope = apply_filters(scope)

      orders, meta = paginate(scope)
      render json: { data: orders.as_json(include: :order_items), meta: meta }
    end

    def show
      order = Order.includes(:order_items, :shipment, :order_status_transitions)
                   .find_by!(order_number: params[:order_number])

      render json: {
        data: order.as_json(include: [ :order_items, :shipment, :order_status_transitions ])
      }
    rescue ActiveRecord::RecordNotFound
      render_not_found("Order not found")
    end

    def status
      order = Order.find_by!(order_number: params[:order_number])
      new_status = params[:status]

      unless VALID_TRANSITIONS[order.status]&.include?(new_status)
        return render json: { error: "Invalid status transition from #{order.status} to #{new_status}" },
                      status: :unprocessable_entity
      end

      old_status = order.status

      ActiveRecord::Base.transaction do
        order.update!(status: new_status, **cancellation_attrs(new_status))

        order.order_status_transitions.create!(
          from_status: Order.statuses[old_status],
          to_status: Order.statuses[new_status],
          note: params[:note]
        )
      end

      audit_log!(action: "order.status_changed", target: order,
                 changes: { from: old_status, to: new_status })

      render json: { data: order.reload.as_json(include: :order_status_transitions) }
    rescue ActiveRecord::RecordNotFound
      render_not_found("Order not found")
    end

    def shipment
      order = Order.find_by!(order_number: params[:order_number])

      if order.shipment.present?
        return render json: { error: "Shipment already exists for this order" }, status: :unprocessable_entity
      end

      old_status = order.status

      ActiveRecord::Base.transaction do
        shipment = order.create_shipment!(
          carrier: params[:carrier],
          tracking_number: params[:tracking_number],
          shipped_at: params[:shipped_at] || Time.current,
          estimated_delivery_at: params[:estimated_delivery_at]
        )

        order.update!(status: :shipped)

        order.order_status_transitions.create!(
          from_status: Order.statuses[old_status],
          to_status: Order.statuses["shipped"],
          note: "Shipment created with tracking: #{shipment.tracking_number}"
        )
      end

      audit_log!(action: "order.shipment_created", target: order,
                 changes: { carrier: params[:carrier], tracking_number: params[:tracking_number] })

      render json: { data: order.reload.as_json(include: [ :shipment, :order_status_transitions ]) },
             status: :created
    rescue ActiveRecord::RecordNotFound
      render_not_found("Order not found")
    end

    private

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?

      if params[:date_from].present?
        scope = scope.where("orders.created_at >= ?", Time.zone.parse(params[:date_from]).beginning_of_day)
      end

      if params[:date_to].present?
        scope = scope.where("orders.created_at <= ?", Time.zone.parse(params[:date_to]).end_of_day)
      end

      if params[:search].present?
        search = "%#{params[:search]}%"
        scope = scope.where("order_number ILIKE :q OR customer_email ILIKE :q", q: search)
      end

      scope
    end

    def cancellation_attrs(new_status)
      return {} unless new_status == "cancelled"

      { cancellation_reason: params[:cancellation_reason] }
    end
  end
end
