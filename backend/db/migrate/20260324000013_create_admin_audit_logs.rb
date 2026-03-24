class CreateAdminAuditLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :admin_audit_logs, id: :uuid do |t|
      t.references :admin_user, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.string :action, null: false
      t.string :target_type
      t.uuid :target_id
      t.jsonb :changes, default: {}

      t.datetime :created_at, null: false
    end

    add_index :admin_audit_logs, [:target_type, :target_id]
  end
end
