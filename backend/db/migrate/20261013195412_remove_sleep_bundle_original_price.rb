class RemoveSleepBundleOriginalPrice < ActiveRecord::Migration[8.1]
  # No bundle is on sale: drop the crossed-out reference price. A sale price must be
  # compared against the lowest price of the previous 30 days, which 105.88 € was not.
  def up
    execute "UPDATE bundles SET original_price = NULL, discount_percent = 0 WHERE slug = 'sleep-bundle'"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
