class MakeProductIdNotNullOnBundleItems < ActiveRecord::Migration[8.0]
  def change
    change_column_null :bundle_items, :product_id, false
  end
end
