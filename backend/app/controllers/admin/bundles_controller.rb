module Admin
  class BundlesController < BaseController
    def index
      bundles = Bundle.includes(bundle_items: :product).order(:position)
      render json: {
        data: bundles.map { |b| serialize_admin_bundle(b) }
      }
    end

    def update
      bundle = Bundle.find(params[:id])
      old_attributes = bundle.attributes.slice(*bundle_params.keys.map(&:to_s))

      if bundle.update(bundle_params)
        audit_log!(action: "bundle.updated", target: bundle,
                   changes: { before: old_attributes, after: bundle.attributes.slice(*bundle_params.keys.map(&:to_s)) })

        render json: { data: serialize_admin_bundle(bundle) }
      else
        render_validation_errors(bundle)
      end
    end

    private

    def bundle_params
      params.permit(:active, :price, :original_price, :discount_percent, :name_hr, :name_en,
                    :short_description_hr, :short_description_en, :description_hr, :description_en,
                    :badge, :position, :image_path)
    end

    def serialize_admin_bundle(bundle)
      {
        id: bundle.id,
        slug: bundle.slug,
        name_hr: bundle.name_hr,
        name_en: bundle.name_en,
        price: bundle.price,
        original_price: bundle.original_price,
        discount_percent: bundle.discount_percent,
        active: bundle.active,
        badge: bundle.badge,
        category: bundle.category,
        image_path: bundle.image_path,
        computed_stock_quantity: bundle.computed_stock_quantity,
        items: bundle.bundle_items.includes(:product).map do |bi|
          {
            product_id: bi.product_id,
            name_hr: bi.product.name_hr,
            name_en: bi.product.name_en,
            quantity: bi.quantity,
            stock_quantity: bi.product.stock_quantity
          }
        end
      }
    end
  end
end
