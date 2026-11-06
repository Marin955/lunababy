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

  # Catalog specs. Missing values are null (certifications: []); the frontend hides them.
  attribute :brand do |item|
    item.product.brand
  end

  attribute :material do |item|
    item.product.localized(:material, params[:locale])
  end

  attribute :dimensions do |item|
    item.product.dimensions
  end

  attribute :age_range do |item|
    item.product.localized(:age_range, params[:locale])
  end

  attribute :certifications do |item|
    item.product.certifications
  end

  attribute :care_instructions do |item|
    item.product.localized(:care_instructions, params[:locale])
  end
end
