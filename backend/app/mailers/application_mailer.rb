class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM", "noreply@lunababy.eu")
  layout "mailer"
end
