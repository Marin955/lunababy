class CreateShipments < ActiveRecord::Migration[8.0]
  def change
    create_table :shipments, id: :uuid do |t|
      t.references :order, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.integer :carrier, null: false
      t.string :tracking_number
      t.datetime :shipped_at
      t.date :estimated_delivery_at

      t.timestamps
    end
  end
end
