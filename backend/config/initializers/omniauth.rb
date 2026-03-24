# OmniAuth is NOT used as middleware in API-only mode.
# Instead, the frontend handles the OAuth redirect flow and sends
# the auth code/token to our API. We verify tokens server-side
# using Google/Facebook APIs directly in OAuthAuthenticator service.
#
# Google client credentials:
#   ENV["GOOGLE_CLIENT_ID"]
#   ENV["GOOGLE_CLIENT_SECRET"]
#
# Facebook client credentials:
#   ENV["FACEBOOK_APP_ID"]
#   ENV["FACEBOOK_APP_SECRET"]
