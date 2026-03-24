class ConvertPricesToIntegerCents < ActiveRecord::Migration[8.0]
  def up
    # Bundles
    change_column :bundles, :price, :integer, null: false
    change_column :bundles, :original_price, :integer

    # Shipping methods
    change_column :shipping_methods, :price, :integer, null: false
    change_column :shipping_methods, :free_threshold, :integer

    # Promo codes
    change_column :promo_codes, :value, :integer
    change_column :promo_codes, :min_order_amount, :integer

    # Orders
    change_column :orders, :subtotal, :integer, null: false
    change_column :orders, :discount_amount, :integer, null: false, default: 0
    change_column :orders, :shipping_cost, :integer, null: false
    change_column :orders, :total, :integer, null: false

    # Order items
    change_column :order_items, :unit_price, :integer, null: false
    change_column :order_items, :line_total, :integer, null: false
  end

  def down
    # Bundles
    change_column :bundles, :price, :decimal, precision: 8, scale: 2, null: false
    change_column :bundles, :original_price, :decimal, precision: 8, scale: 2

    # Shipping methods
    change_column :shipping_methods, :price, :decimal, precision: 8, scale: 2, null: false
    change_column :shipping_methods, :free_threshold, :decimal, precision: 8, scale: 2

    # Promo codes
    change_column :promo_codes, :value, :decimal, precision: 8, scale: 2
    change_column :promo_codes, :min_order_amount, :decimal, precision: 8, scale: 2

    # Orders
    change_column :orders, :subtotal, :decimal, precision: 8, scale: 2, null: false
    change_column :orders, :discount_amount, :decimal, precision: 8, scale: 2, null: false, default: 0
    change_column :orders, :shipping_cost, :decimal, precision: 8, scale: 2, null: false
    change_column :orders, :total, :decimal, precision: 8, scale: 2, null: false

    # Order items
    change_column :order_items, :unit_price, :decimal, precision: 8, scale: 2, null: false
    change_column :order_items, :line_total, :decimal, precision: 8, scale: 2, null: false
  end
end
