class ModifyBundleItemsForProducts < ActiveRecord::Migration[8.0]
  def change
    add_reference :bundle_items, :product, type: :uuid, foreign_key: true

    remove_column :bundle_items, :name_hr, :string
    remove_column :bundle_items, :name_en, :string
    remove_column :bundle_items, :description_hr, :text
    remove_column :bundle_items, :description_en, :text

    add_index :bundle_items, [:bundle_id, :product_id], unique: true
  end
end
