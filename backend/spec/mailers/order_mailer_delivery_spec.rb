require "rails_helper"

RSpec.describe OrderMailer, "delivery details" do
  let(:locker) { create(:shipping_method, :pickup) }

  it "shows the pickup point in the confirmation email" do
    order = create(:order, :with_items, shipping_method: locker, pickup_point_provider: "boxnow",
                   pickup_point_id: "BN-1234", pickup_point_name: "BOX NOW Konzum Ilica",
                   pickup_point_address: "Ilica 242, 10000 Zagreb")

    body = described_class.confirmation(order).body.encoded
    expect(body).to include("Paketomat:", "BoxNow", "BOX NOW Konzum Ilica", "BN-1234", "Ilica 242, 10000 Zagreb")
  end

  it "shows the pickup point in English" do
    order = create(:order, :with_items, shipping_method: locker, language: :en, pickup_point_provider: "gls",
                   pickup_point_id: "GLS-77", pickup_point_name: "GLS Locker Savska")

    body = described_class.confirmation(order).body.encoded
    expect(body).to include("Pickup point:", "GLS", "GLS Locker Savska", "GLS-77")
  end

  it "shows the home address for home delivery" do
    order = create(:order, :with_items)

    body = described_class.confirmation(order).body.encoded
    expect(body).to include("Adresa:", "Ilica 1", "10000 Zagreb")
    expect(body).not_to include("Paketomat:")
  end

  it "rejects a locker order without a pickup point" do
    order = build(:order, shipping_method: locker)
    expect(order).not_to be_valid
    expect(order.errors[:pickup_point_id]).to be_present
  end
end
