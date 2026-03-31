class MakeProductIdNotNullOnBundleItems < ActiveRecord::Migration[8.0]
  def up
    # Remove legacy bundle_items that have no product association
    # (seeds will recreate them with proper product references)
    execute "DELETE FROM bundle_items WHERE product_id IS NULL"
    change_column_null :bundle_items, :product_id, false
  end

  def down
    change_column_null :bundle_items, :product_id, true
  end
end
