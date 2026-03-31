class ProductSerializer
  include Alba::Resource

  attributes :id, :sku, :name_hr, :name_en, :description_hr, :description_en,
             :purchase_price, :purchase_price_with_vat, :msrp,
             :supplier_name, :supplier_url, :image_path,
             :stock_quantity, :low_stock_threshold, :active, :position

  attribute :sex do |product|
    product.sex
  end

  attribute :bundles do |product|
    product.bundles.map do |b|
      { id: b.id, name_hr: b.name_hr, name_en: b.name_en, slug: b.slug }
    end
  end
end
