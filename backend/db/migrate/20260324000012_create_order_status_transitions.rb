class CreateOrderStatusTransitions < ActiveRecord::Migration[8.0]
  def change
    create_table :order_status_transitions, id: :uuid do |t|
      t.references :order, null: false, foreign_key: true, type: :uuid
      t.integer :from_status
      t.integer :to_status, null: false
      t.text :note

      t.datetime :created_at, null: false
    end
  end
end
