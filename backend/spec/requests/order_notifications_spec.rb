require "rails_helper"

RSpec.describe "Order emails", type: :request do
  include ActiveJob::TestHelper

  let!(:admin) { create(:user, :admin) }
  let!(:shipping) { create(:shipping_method, slug: "standard", price: 350) }
  let!(:bundle) { create(:bundle, :with_items, price: 3990) }

  let(:order_params) do
    {
      customer_email: "buyer@example.com",
      customer_name: "Ana Horvat",
      shipping_method_id: shipping.id,
      language: "hr",
      shipping_address: { first_name: "Ana", last_name: "Horvat", street: "Ilica 1", city: "Zagreb", postal_code: "10000" },
      items: [ { bundle_id: bundle.id, quantity: 1 } ]
    }
  end

  it "emails a status update when an admin changes the order status" do
    order = create(:order, shipping_method: shipping, status: :pending, language: :en)

    perform_enqueued_jobs do
      patch "/admin/orders/#{order.order_number}/status", params: { status: "confirmed" }, headers: auth_headers(admin)
    end

    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq([ order.customer_email ])
    expect(mail.subject).to eq("Order #{order.order_number} - Confirmed")
  end

  it "emails tracking details when an admin creates a shipment" do
    order = create(:order, shipping_method: shipping, status: :processing)

    perform_enqueued_jobs do
      post "/admin/orders/#{order.order_number}/shipment",
           params: { carrier: "gls", tracking_number: "GLS987654321" }, headers: auth_headers(admin)
    end

    mail = ActionMailer::Base.deliveries.last
    expect(mail.subject).to eq("Vaša narudžba #{order.order_number} je poslana!")
    expect(mail.body.to_s).to include("GLS987654321")
  end

  it "does not email anyone when a status change is rejected" do
    order = create(:order, shipping_method: shipping, status: :pending)

    patch "/admin/orders/#{order.order_number}/status", params: { status: "delivered" }, headers: auth_headers(admin)

    expect(response).to have_http_status(:unprocessable_entity)
    expect(enqueued_jobs).to be_empty
  end
end
