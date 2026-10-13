class ContactMailer < ApplicationMailer
  INBOX = ENV.fetch("CONTACT_EMAIL", "info@lunababy.eu")

  def new_message(name:, email:, subject:, message:, language:)
    @name = name
    @email = email
    @message = message
    @language = language

    mail(
      to: INBOX,
      reply_to: email,
      subject: "[Kontakt] #{subject}"
    )
  end
end
