class ApplicationMailer < ActionMailer::Base
  # Replies to automated mail (e.g. order confirmations) reach the shop inbox
  # instead of bouncing off noreply@. Mailers may override, e.g. ContactMailer.
  default from: ENV.fetch("SMTP_FROM", "noreply@lunababy.eu"),
          reply_to: ENV.fetch("REPLY_TO_EMAIL", "info@lunababy.eu")
  layout "mailer"
end
