require "rails_helper"

RSpec.describe "POST /api/v1/contact_messages", type: :request do
  include ActiveJob::TestHelper

  let(:valid_params) do
    {
      name: "Ana Horvat",
      email: "ana@example.com",
      subject: "Pitanje o paketu",
      message: "Je li paket za spavanje dostupan?\nHvala!",
      language: "hr"
    }
  end

  it "emails the message to the shop inbox with Reply-To set to the sender" do
    perform_enqueued_jobs do
      post "/api/v1/contact_messages", params: valid_params
    end

    expect(response).to have_http_status(:ok)
    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq([ "info@lunababy.eu" ])
    expect(mail.reply_to).to eq([ "ana@example.com" ])
    expect(mail.subject).to eq("[Kontakt] Pitanje o paketu")
    expect(mail.text_part.body.to_s).to include("Je li paket za spavanje dostupan?")
  end

  it "rejects missing fields and an invalid email" do
    post "/api/v1/contact_messages", params: valid_params.merge(email: "not-an-email", message: "")

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.parsed_body["errors"].keys).to contain_exactly("email", "message")
    expect(enqueued_jobs).to be_empty
  end

  it "keeps a multi-line subject on one line so it cannot inject headers" do
    perform_enqueued_jobs do
      post "/api/v1/contact_messages", params: valid_params.merge(subject: "Pitanje\r\nBcc: victim@example.com")
    end

    mail = ActionMailer::Base.deliveries.last
    expect(mail.subject).to eq("[Kontakt] Pitanje Bcc: victim@example.com")
    expect(mail.bcc).to be_nil
  end

  it "silently drops submissions that fill in the honeypot field" do
    post "/api/v1/contact_messages", params: valid_params.merge(website: "http://spam.example")

    expect(response).to have_http_status(:ok)
    expect(enqueued_jobs).to be_empty
  end
end
