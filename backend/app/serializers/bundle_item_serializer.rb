class BundleItemSerializer
  include Alba::Resource

  attributes :quantity

  attribute :name do |item|
    params[:locale] == "en" ? item.name_en : item.name_hr
  end

  attribute :description do |item|
    params[:locale] == "en" ? item.description_en : item.description_hr
  end
end
