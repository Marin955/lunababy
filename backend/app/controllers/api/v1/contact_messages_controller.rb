module Api
  module V1
    class ContactMessagesController < ApplicationController
      def create
        # Honeypot: a hidden field humans never fill in. Pretend success so bots don't adapt.
        return render(json: { message: "Message sent" }, status: :ok) if params[:website].present?

        contact = ContactMessage.new(contact_params)

        if contact.valid?
          ContactMailer.new_message(
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            language: contact.language
          ).deliver_later
          render json: { message: "Message sent" }, status: :ok
        else
          render_validation_errors(contact)
        end
      end

      private

      def contact_params
        params.permit(:name, :email, :subject, :message, :language)
      end
    end
  end
end
