class AddPasswordDigestToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :password_digest, :string

    # Set password for existing admin user
    admin = User.find_by(role: 1) # admin enum value
    if admin
      admin.update_columns(
        password_digest: BCrypt::Password.create(ENV.fetch("ADMIN_PASSWORD", "admin123!"))
      )
    end
  end

  def down
    remove_column :users, :password_digest
  end
end
