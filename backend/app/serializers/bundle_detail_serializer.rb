class BundleDetailSerializer
  include Alba::Resource

  attributes :id, :slug, :price, :original_price, :category, :emoji, :color_from, :color_to

  attribute :badge do |bundle|
    bundle.badge
  end

  attribute :name do |bundle|
    params[:locale] == "en" ? bundle.name_en : bundle.name_hr
  end

  attribute :short_description do |bundle|
    params[:locale] == "en" ? bundle.short_description_en : bundle.short_description_hr
  end

  attribute :description do |bundle|
    params[:locale] == "en" ? bundle.description_en : bundle.description_hr
  end

  attribute :in_stock do |bundle|
    bundle.in_stock?
  end

  many :bundle_items, key: :items, resource: BundleItemSerializer do |bundle|
    bundle.bundle_items.order(:position)
  end
end
