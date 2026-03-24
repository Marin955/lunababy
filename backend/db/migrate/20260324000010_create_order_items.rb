class CreateOrderItems < ActiveRecord::Migration[8.0]
  def change
    create_table :order_items, id: :uuid do |t|
      t.references :order, null: false, foreign_key: true, type: :uuid
      t.references :bundle, null: false, foreign_key: true, type: :uuid
      t.string :bundle_name, null: false
      t.integer :quantity, null: false
      t.decimal :unit_price, precision: 8, scale: 2, null: false
      t.decimal :line_total, precision: 8, scale: 2, null: false

      t.datetime :created_at, null: false
    end
  end
end
