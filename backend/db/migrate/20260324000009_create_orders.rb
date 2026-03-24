class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders, id: :uuid do |t|
      t.string :order_number, null: false
      t.references :user, foreign_key: true, type: :uuid, null: true
      t.integer :status, null: false, default: 0
      t.decimal :subtotal, precision: 8, scale: 2, null: false
      t.decimal :discount_amount, precision: 8, scale: 2, default: 0, null: false
      t.decimal :shipping_cost, precision: 8, scale: 2, null: false
      t.decimal :total, precision: 8, scale: 2, null: false
      t.references :promo_code, foreign_key: true, type: :uuid, null: true
      t.references :shipping_method, null: false, foreign_key: true, type: :uuid
      t.string :customer_email, null: false
      t.string :customer_name, null: false
      t.string :shipping_first_name, null: false
      t.string :shipping_last_name, null: false
      t.string :shipping_street, null: false
      t.string :shipping_city, null: false
      t.string :shipping_postal_code, null: false
      t.string :shipping_phone
      t.string :shipping_company
      t.text :note
      t.integer :language, null: false, default: 0
      t.text :cancellation_reason

      t.timestamps
    end

    add_index :orders, :order_number, unique: true
  end
end
