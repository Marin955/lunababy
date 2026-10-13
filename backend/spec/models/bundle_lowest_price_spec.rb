require "rails_helper"

RSpec.describe Bundle, "#lowest_price_last_30_days" do
  let(:bundle) { create(:bundle, price: 5000) }

  it "records a price change whenever the price changes" do
    expect { bundle.update!(price: 4500) }.to change { bundle.price_changes.count }.by(1)
    expect { bundle.update!(name_en: "Renamed") }.not_to change { bundle.price_changes.count }
  end

  it "returns the current price when it never changed" do
    expect(bundle.lowest_price_last_30_days).to eq(5000)
  end

  it "includes a lower price from within the last 30 days" do
    bundle.update!(price: 4000)
    bundle.update!(price: 5500)

    expect(bundle.lowest_price_last_30_days).to eq(4000)
  end

  it "ignores prices that ended before the window, but counts the one in effect when it opened" do
    bundle.price_changes.delete_all
    bundle.price_changes.create!(price: 3000, created_at: 60.days.ago)
    bundle.price_changes.create!(price: 4800, created_at: 40.days.ago)
    bundle.price_changes.create!(price: 5000, created_at: 10.days.ago)

    expect(bundle.lowest_price_last_30_days).to eq(4800)
  end

  it "is exposed on the bundle detail endpoint", type: :request do
    bundle.update!(price: 4200)
    bundle.update!(price: 5000)

    get "/api/v1/bundles/#{bundle.slug}", params: { locale: "hr" }

    expect(response.parsed_body.dig("data", "lowest_price_30_days")).to eq(4200)
  end
end
