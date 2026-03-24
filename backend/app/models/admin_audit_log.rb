class AdminAuditLog < ApplicationRecord
  belongs_to :admin_user, class_name: 'User'

  validates :action, presence: true
end
