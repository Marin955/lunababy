module Admin
  class BundlesController < BaseController
    def index
      bundles = Bundle.includes(:bundle_items).order(:position)
      render json: {
        data: bundles.as_json(
          include: :bundle_items,
          methods: [ :in_stock? ]
        )
      }
    end

    def update
      bundle = Bundle.find(params[:id])
      old_attributes = bundle.attributes.slice(*bundle_params.keys.map(&:to_s))

      if bundle.update(bundle_params)
        audit_log!(action: "bundle.updated", target: bundle,
                   changes: { before: old_attributes, after: bundle.attributes.slice(*bundle_params.keys.map(&:to_s)) })

        render json: { data: bundle.as_json(include: :bundle_items) }
      else
        render_validation_errors(bundle)
      end
    end

    private

    def bundle_params
      params.permit(:stock_quantity, :active, :price, :original_price, :name_hr, :name_en,
                    :short_description_hr, :short_description_en, :description_hr, :description_en,
                    :badge, :position, :low_stock_threshold)
    end
  end
end
