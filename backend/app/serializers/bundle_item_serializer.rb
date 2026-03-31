class BundleItemSerializer
  include Alba::Resource

  attributes :id, :quantity

  attribute :product_id do |item|
    item.product_id
  end

  attribute :name do |item|
    product = item.product
    params[:locale] == "en" ? product.name_en : product.name_hr
  end

  attribute :description do |item|
    product = item.product
    params[:locale] == "en" ? product.description_en : product.description_hr
  end

  attribute :image_path do |item|
    item.product.image_path
  end
end
