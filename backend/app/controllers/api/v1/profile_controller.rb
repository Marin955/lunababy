module Api
  module V1
    class ProfileController < ApplicationController
      before_action :authenticate_user!

      def show
        render json: { data: UserSerializer.new(current_user).serializable_hash }
      end

      def update
        if current_user.update(profile_params)
          render json: { data: UserSerializer.new(current_user).serializable_hash }
        else
          render_validation_errors(current_user)
        end
      end

      private

      def profile_params
        params.permit(:name, :phone, :language)
      end
    end
  end
end
