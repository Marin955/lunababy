class RenameChangesToChangeDataInAdminAuditLogs < ActiveRecord::Migration[8.0]
  def change
    rename_column :admin_audit_logs, :changes, :change_data
  end
end
