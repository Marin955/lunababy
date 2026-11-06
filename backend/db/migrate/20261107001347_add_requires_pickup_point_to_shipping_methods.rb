class AddRequiresPickupPointToShippingMethods < ActiveRecord::Migration[8.1]
  def up
    add_column :shipping_methods, :requires_pickup_point, :boolean, default: false, null: false
    # The parcel-locker method (slug from db/seeds.rb) needs a locker chosen at checkout.
    execute "UPDATE shipping_methods SET requires_pickup_point = TRUE WHERE slug = 'pickup'"
  end

  def down
    remove_column :shipping_methods, :requires_pickup_point
  end
end
