module Api
  module V1
    class PromoCodesController < ApplicationController
      def validate
        validator = PromoCodeValidator.new(
          code: params[:code],
          cart_total: params[:cart_total],
          locale: locale
        )
        render json: { data: validator.validate }
      end
    end
  end
end
