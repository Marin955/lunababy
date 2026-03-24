module Api
  module V1
    class ShippingMethodsController < ApplicationController
      def index
        methods = ShippingMethod.active
        render json: { data: methods.map { |m| ShippingMethodSerializer.new(m, params: { locale: locale }).serializable_hash } }
      end
    end
  end
end
