class CreateBundleItems < ActiveRecord::Migration[8.0]
  def change
    create_table :bundle_items, id: :uuid do |t|
      t.references :bundle, null: false, foreign_key: true, type: :uuid
      t.string :name_hr, null: false
      t.string :name_en, null: false
      t.text :description_hr
      t.text :description_en
      t.integer :quantity, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end
  end
end
