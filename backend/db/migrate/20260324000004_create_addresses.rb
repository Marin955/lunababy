class CreateAddresses < ActiveRecord::Migration[8.0]
  def change
    create_table :addresses, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :street, null: false
      t.string :city, null: false
      t.string :postal_code, null: false
      t.string :phone
      t.string :company
      t.boolean :is_default, default: false, null: false

      t.timestamps
    end
  end
end
