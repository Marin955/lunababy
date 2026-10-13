class CreateBundlePriceChanges < ActiveRecord::Migration[8.1]
  # Price history per bundle, needed to show the lowest price in the last 30 days
  # (Croatian consumer protection law / EU Omnibus directive).
  def up
    create_table :bundle_price_changes, id: :uuid do |t|
      t.references :bundle, type: :uuid, null: false, foreign_key: true
      t.integer :price, null: false
      t.datetime :created_at, null: false
    end
    add_index :bundle_price_changes, [:bundle_id, :created_at]

    # Seed history with each bundle's current price; there is no earlier data to recover.
    execute <<~SQL
      INSERT INTO bundle_price_changes (id, bundle_id, price, created_at)
      SELECT gen_random_uuid(), id, price, NOW() FROM bundles
    SQL
  end

  def down
    drop_table :bundle_price_changes
  end
end
