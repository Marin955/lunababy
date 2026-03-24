class ApplicationController < ActionController::API
  include Authenticatable

  before_action :set_locale

  private

  def set_locale
    @locale = %w[hr en].include?(params[:locale]) ? params[:locale] : "hr"
  end

  def locale
    @locale
  end

  def render_validation_errors(record)
    render json: { errors: record.errors.messages }, status: :unprocessable_entity
  end

  def render_not_found(message = "Not found")
    render json: { error: message }, status: :not_found
  end
end
