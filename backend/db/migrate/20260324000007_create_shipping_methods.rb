class CreateShippingMethods < ActiveRecord::Migration[8.0]
  def change
    create_table :shipping_methods, id: :uuid do |t|
      t.string :slug, null: false
      t.string :name_hr, null: false
      t.string :name_en, null: false
      t.string :carrier
      t.text :description_hr
      t.text :description_en
      t.decimal :price, precision: 8, scale: 2, null: false
      t.string :estimated_days
      t.decimal :free_threshold, precision: 8, scale: 2
      t.boolean :active, default: true, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end

    add_index :shipping_methods, :slug, unique: true
  end
end
