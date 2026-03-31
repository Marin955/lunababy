class ModifyBundlesForComputedStock < ActiveRecord::Migration[8.0]
  def change
    add_column :bundles, :image_path, :string

    remove_column :bundles, :stock_quantity, :integer, default: 0, null: false
    remove_column :bundles, :low_stock_threshold, :integer, default: 5, null: false
  end
end
