class CreateBundles < ActiveRecord::Migration[8.0]
  def change
    create_table :bundles, id: :uuid do |t|
      t.string :slug, null: false
      t.string :name_hr, null: false
      t.string :name_en, null: false
      t.text :description_hr
      t.text :description_en
      t.text :short_description_hr
      t.text :short_description_en
      t.decimal :price, precision: 8, scale: 2, null: false
      t.decimal :original_price, precision: 8, scale: 2
      t.integer :stock_quantity, default: 0, null: false
      t.integer :low_stock_threshold, default: 5, null: false
      t.string :category
      t.string :emoji
      t.string :color_from
      t.string :color_to
      t.integer :badge
      t.boolean :active, default: true, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :bundles, :slug, unique: true
  end
end
