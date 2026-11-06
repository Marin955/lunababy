class AddPickupPointAndTermsToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :pickup_point_provider, :string
    add_column :orders, :pickup_point_id, :string
    add_column :orders, :pickup_point_name, :string
    add_column :orders, :pickup_point_address, :string
    add_column :orders, :terms_accepted_at, :datetime
  end
end
