class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products, id: :uuid do |t|
      t.string :name_hr, null: false
      t.string :name_en, null: false
      t.text :description_hr
      t.text :description_en
      t.integer :sex, null: false, default: 0
      t.integer :purchase_price, null: false, default: 0
      t.integer :purchase_price_with_vat, null: false, default: 0
      t.integer :msrp, null: false, default: 0
      t.string :supplier_name
      t.string :supplier_url
      t.string :image_path
      t.integer :stock_quantity, null: false, default: 0
      t.integer :low_stock_threshold, null: false, default: 5
      t.string :sku
      t.boolean :active, null: false, default: true
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :products, :sku, unique: true, where: "sku IS NOT NULL"
  end
end
