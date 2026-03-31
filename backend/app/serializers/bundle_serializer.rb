class BundleSerializer
  include Alba::Resource

  attributes :id, :slug, :price, :original_price, :discount_percent, :category, :emoji, :color_from, :color_to, :image_path

  attribute :badge do |bundle|
    bundle.badge
  end

  attribute :name do |bundle|
    params[:locale] == "en" ? bundle.name_en : bundle.name_hr
  end

  attribute :short_description do |bundle|
    params[:locale] == "en" ? bundle.short_description_en : bundle.short_description_hr
  end

  attribute :in_stock do |bundle|
    bundle.in_stock?
  end
end
