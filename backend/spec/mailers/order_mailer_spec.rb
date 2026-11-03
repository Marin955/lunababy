require "rails_helper"

RSpec.describe OrderMailer do
  it "sends from noreply@ with replies going to the shop inbox" do
    mail = described_class.confirmation(create(:order))

    expect(mail.from).to eq([ "noreply@lunababy.eu" ])
    expect(mail.reply_to).to eq([ "info@lunababy.eu" ])
  end
end
