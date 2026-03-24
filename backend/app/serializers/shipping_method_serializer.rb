class ShippingMethodSerializer
  include Alba::Resource

  attributes :id, :slug, :carrier, :price, :estimated_days, :free_threshold

  attribute :name do |sm|
    params[:locale] == "en" ? sm.name_en : sm.name_hr
  end

  attribute :description do |sm|
    params[:locale] == "en" ? sm.description_en : sm.description_hr
  end
end
