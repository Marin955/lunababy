class CreatePromoCodes < ActiveRecord::Migration[8.0]
  def change
    create_table :promo_codes, id: :uuid do |t|
      t.string :code, null: false
      t.integer :discount_type, null: false
      t.decimal :value, precision: 8, scale: 2
      t.decimal :min_order_amount, precision: 8, scale: 2
      t.integer :max_uses
      t.integer :current_use_count, default: 0, null: false
      t.string :label_hr
      t.string :label_en
      t.boolean :active, default: true, null: false
      t.datetime :expires_at

      t.timestamps
    end

    add_index :promo_codes, :code, unique: true
  end
end
