module Admin
  class ProductsController < BaseController
    def index
      products = Product.includes(:bundles).ordered
      products, meta = paginate(products)

      render json: {
        data: products.map { |p| ProductSerializer.new(p).serializable_hash },
        meta: meta
      }
    end

    def show
      product = Product.includes(:bundles).find(params[:id])
      render json: { data: ProductSerializer.new(product).serializable_hash }
    end

    def update
      product = Product.find(params[:id])
      old_attributes = product.attributes.slice(*product_params.keys.map(&:to_s))

      if product.update(product_params)
        audit_log!(action: "product.updated", target: product,
                   changes: { before: old_attributes, after: product.attributes.slice(*product_params.keys.map(&:to_s)) })

        render json: { data: ProductSerializer.new(product).serializable_hash }
      else
        render_validation_errors(product)
      end
    end

    def adjust_stock
      product = Product.find(params[:id])
      adjustment = params[:adjustment].to_i
      reason = params[:reason]

      raise ActionController::BadRequest, "Adjustment cannot be zero" if adjustment == 0

      previous_stock = product.stock_quantity
      new_stock = previous_stock + adjustment
      raise ActionController::BadRequest, "Stock cannot go below zero" if new_stock < 0

      product.update!(stock_quantity: new_stock)

      audit_log!(action: "product.stock_adjusted", target: product,
                 changes: { previous_stock: previous_stock, new_stock: new_stock, adjustment: adjustment, reason: reason })

      render json: {
        data: {
          id: product.id,
          stock_quantity: product.stock_quantity,
          previous_stock: previous_stock,
          adjustment: adjustment
        }
      }
    end

    private

    def product_params
      params.require(:product).permit(
        :name_hr, :name_en, :description_hr, :description_en,
        :stock_quantity, :low_stock_threshold, :active
      )
    end
  end
end
