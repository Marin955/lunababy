class User < ApplicationRecord
  has_secure_password validations: false

  has_many :oauth_identities, dependent: :destroy
  has_many :addresses, dependent: :destroy
  has_many :orders, dependent: :nullify
  has_many :admin_audit_logs, foreign_key: :admin_user_id, dependent: :nullify

  enum :role, { customer: 0, admin: 1 }
  enum :language, { hr: 0, en: 1 }

  validates :name, presence: true
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password_digest_changed? && password.present? }
end
