class OAuthAuthenticator
  def find_or_create_user_from_oauth(provider:, uid:, email:, name:)
    identity = OAuthIdentity.find_by(provider: provider, provider_uid: uid)
    return identity.user if identity

    ActiveRecord::Base.transaction do
      user = User.find_or_create_by!(email: email.downcase) do |u|
        u.name = name
      end

      user.oauth_identities.create!(
        provider: provider,
        provider_uid: uid
      )

      user
    end
  end
end
