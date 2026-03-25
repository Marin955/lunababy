class AddDiscountPercentToBundles < ActiveRecord::Migration[8.1]
  def change
    add_column :bundles, :discount_percent, :integer, default: 0, null: false
  end
end
