class MakeSleepBundleOnlyPopular < ActiveRecord::Migration[8.1]
  # Only the sleep bundle carries a badge ("popular"); no "new" or "sale" badges anywhere.
  def up
    execute "UPDATE bundles SET badge = NULL WHERE slug <> 'sleep-bundle'"
    execute "UPDATE bundles SET badge = 1 WHERE slug = 'sleep-bundle'"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
