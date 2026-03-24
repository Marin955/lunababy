module Admin
  class DashboardController < BaseController
    def show
      render json: {
        data: {
          total_orders: Order.count,
          orders_by_status: orders_by_status,
          revenue_total: Order.where.not(status: [ :cancelled, :refunded ]).sum(:total),
          recent_orders: recent_orders,
          low_stock_bundles: low_stock_bundles
        }
      }
    end

    private

    def orders_by_status
      Order.group(:status).count.transform_keys { |k| Order.statuses.key(k) || k }
    end

    def recent_orders
      Order.order(created_at: :desc).limit(10).as_json(
        only: [ :id, :order_number, :customer_name, :customer_email, :total, :status, :created_at ]
      )
    end

    def low_stock_bundles
      Bundle.where("stock_quantity < low_stock_threshold").as_json(
        only: [ :id, :slug, :name_hr, :name_en, :stock_quantity, :low_stock_threshold, :active ]
      )
    end
  end
end
