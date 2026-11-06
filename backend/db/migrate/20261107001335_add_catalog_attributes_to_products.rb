class AddCatalogAttributesToProducts < ActiveRecord::Migration[8.1]
  def change
    change_table :products, bulk: true do |t|
      t.string :brand
      t.text :material_hr
      t.text :material_en
      t.string :dimensions
      t.string :age_range_hr
      t.string :age_range_en
      t.string :certifications, array: true, default: [], null: false
      t.text :care_instructions_hr
      t.text :care_instructions_en
    end
  end
end
