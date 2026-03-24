module Api
  module V1
    module Profile
      class AddressesController < ApplicationController
        before_action :authenticate_user!

        def create
          address = current_user.addresses.build(address_params)

          if address.save
            render json: { data: AddressSerializer.new(address).serializable_hash }, status: :created
          else
            render_validation_errors(address)
          end
        end

        def update
          address = current_user.addresses.find(params[:id])

          if address.update(address_params)
            render json: { data: AddressSerializer.new(address).serializable_hash }
          else
            render_validation_errors(address)
          end
        rescue ActiveRecord::RecordNotFound
          render_not_found("Address not found")
        end

        def destroy
          address = current_user.addresses.find(params[:id])
          address.destroy!

          render json: { message: "Address deleted" }
        rescue ActiveRecord::RecordNotFound
          render_not_found("Address not found")
        end

        private

        def address_params
          params.permit(:first_name, :last_name, :street, :city, :postal_code, :phone, :company, :is_default)
        end
      end
    end
  end
end
