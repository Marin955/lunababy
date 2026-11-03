class AddPaymentToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :payment_status, :integer, default: 0, null: false
    add_column :orders, :stripe_checkout_session_id, :string
    add_column :orders, :stripe_payment_intent_id, :string
    add_column :orders, :paid_at, :datetime
    add_index :orders, :stripe_checkout_session_id, unique: true
  end
end
