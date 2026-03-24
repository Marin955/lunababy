class OAuthIdentity < ApplicationRecord
  self.table_name = 'oauth_identities'

  belongs_to :user

  enum :provider, { google: 0, facebook: 1 }

  validates :provider, presence: true
  validates :provider_uid, presence: true, uniqueness: { scope: :provider }
end
