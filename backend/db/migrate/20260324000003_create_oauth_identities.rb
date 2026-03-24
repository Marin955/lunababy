class CreateOauthIdentities < ActiveRecord::Migration[8.0]
  def change
    create_table :oauth_identities, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.integer :provider, null: false
      t.string :provider_uid, null: false
      t.string :access_token
      t.string :refresh_token
      t.datetime :token_expires_at

      t.timestamps
    end

    add_index :oauth_identities, [:provider, :provider_uid], unique: true
  end
end
