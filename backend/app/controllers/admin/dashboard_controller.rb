module Admin
  class DashboardController < BaseController
    def show
      render json: {
        data: {
          total_orders: Order.count,
          orders_by_status: orders_by_status,
          revenue_total: Order.where.not(status: [ :cancelled, :refunded ]).sum(:total),
          recent_orders: recent_orders,
          low_stock_products: low_stock_products
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

    def low_stock_products
      Product.where("stock_quantity <= low_stock_threshold")
             .includes(:bundles)
             .order(:stock_quantity)
             .map do |product|
        {
          id: product.id,
          name_hr: product.name_hr,
          name_en: product.name_en,
          stock_quantity: product.stock_quantity,
          low_stock_threshold: product.low_stock_threshold,
          bundles: product.bundles.pluck(:name_hr)
        }
      end
    end
  end
end
