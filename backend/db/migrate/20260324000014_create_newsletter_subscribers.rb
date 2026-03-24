class CreateNewsletterSubscribers < ActiveRecord::Migration[8.0]
  def change
    create_table :newsletter_subscribers, id: :uuid do |t|
      t.string :email, null: false
      t.integer :language, null: false, default: 0
      t.boolean :active, default: true, null: false
      t.datetime :subscribed_at

      t.timestamps
    end

    add_index :newsletter_subscribers, :email, unique: true
  end
end
