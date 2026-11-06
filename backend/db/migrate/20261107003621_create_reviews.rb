class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    # A row is created when the review request email goes out (it carries the
    # token); rating/title/body are filled in when the customer submits.
    create_table :reviews, id: :uuid do |t|
      t.references :order, type: :uuid, null: false, foreign_key: true, index: false
      t.references :bundle, type: :uuid, null: false, foreign_key: true, index: false
      t.integer :rating
      t.string :title
      t.text :body
      t.string :author_display_name, null: false
      t.string :locale, null: false, default: "hr"
      t.integer :status, null: false, default: 0
      t.string :token, null: false
      t.datetime :token_expires_at, null: false
      t.datetime :submitted_at
      t.datetime :approved_at
      t.timestamps
    end

    add_index :reviews, :token, unique: true
    add_index :reviews, [ :order_id, :bundle_id ], unique: true
    add_index :reviews, [ :bundle_id, :status, :approved_at ]
    add_check_constraint :reviews, "rating IS NULL OR (rating BETWEEN 1 AND 5)", name: "reviews_rating_range"
  end
end
