module Admin
  class PromoCodesController < BaseController
    def index
      promo_codes = PromoCode.order(created_at: :desc)
      render json: { data: promo_codes.as_json }
    end

    def create
      promo_code = PromoCode.new(promo_code_params)

      if promo_code.save
        audit_log!(action: "promo_code.created", target: promo_code,
                   changes: promo_code.attributes.except("id", "created_at", "updated_at"))

        render json: { data: promo_code.as_json }, status: :created
      else
        render_validation_errors(promo_code)
      end
    end

    def update
      promo_code = PromoCode.find(params[:id])
      old_attributes = promo_code.attributes.slice(*promo_code_params.keys.map(&:to_s))

      if promo_code.update(promo_code_params)
        audit_log!(action: "promo_code.updated", target: promo_code,
                   changes: { before: old_attributes, after: promo_code.attributes.slice(*promo_code_params.keys.map(&:to_s)) })

        render json: { data: promo_code.as_json }
      else
        render_validation_errors(promo_code)
      end
    end

    private

    def promo_code_params
      params.permit(:code, :discount_type, :value, :active, :expires_at,
                    :max_uses, :min_order_amount, :label_hr, :label_en)
    end
  end
end
