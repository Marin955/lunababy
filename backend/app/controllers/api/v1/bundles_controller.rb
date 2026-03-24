module Api
  module V1
    class BundlesController < ApplicationController
      def index
        bundles = Bundle.active.includes(:bundle_items).order(:position)
        render json: { data: bundles.map { |b| BundleSerializer.new(b, params: { locale: locale }).serializable_hash } }
      end

      def show
        bundle = Bundle.active.includes(:bundle_items).find_by!(slug: params[:slug])
        render json: { data: BundleDetailSerializer.new(bundle, params: { locale: locale }).serializable_hash }
      rescue ActiveRecord::RecordNotFound
        render_not_found("Bundle not found")
      end
    end
  end
end
