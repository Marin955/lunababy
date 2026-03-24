module Auditable
  extend ActiveSupport::Concern

  private

  def audit_log!(action:, target:, changes: {})
    AdminAuditLog.create!(
      admin_user: current_user,
      action: action,
      target_type: target.class.name,
      target_id: target.id,
      change_data: changes
    )
  end
end
