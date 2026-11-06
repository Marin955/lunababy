require "rails_helper"

# Terms acceptance and parcel-locker pickup points on POST /api/v1/orders.
RSpec.describe "API V1 Orders: terms and pickup points", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let!(:bundle) { create(:bundle, :with_items, price: 3990) }
  let!(:home_delivery) { create(:shipping_method, slug: "standard") }
  let!(:locker) { create(:shipping_method, :pickup, price: 250) }

  let(:pickup_point) do
    { provider: "boxnow", id: "BN-1234", name: "BOX NOW Konzum Ilica", address: "Ilica 242, 10000 Zagreb" }
  end

  def order_params(shipping_method:, **overrides)
    {
      customer_email: "buyer@example.com",
      customer_name: "Ana Horvat",
      shipping_method_id: shipping_method.id,
      language: "hr",
      terms_accepted: true,
      shipping_address: { first_name: "Ana", last_name: "Horvat", street: "Ilica 1", city: "Zagreb",
                          postal_code: "10000", phone: "+385911234567" },
      items: [ { bundle_id: bundle.id, quantity: 1 } ]
    }.merge(overrides)
  end

  describe "terms of sale" do
    it "rejects an order without terms acceptance" do
      expect {
        post "/api/v1/orders", params: order_params(shipping_method: home_delivery, terms_accepted: false)
      }.not_to change(Order, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Terms")
    end

    it "rejects an order when the flag is missing" do
      post "/api/v1/orders", params: order_params(shipping_method: home_delivery).except(:terms_accepted)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not reserve stock for a rejected order" do
      product = bundle.bundle_items.first.product
      expect {
        post "/api/v1/orders", params: order_params(shipping_method: home_delivery, terms_accepted: false)
      }.not_to change { product.reload.stock_quantity }
    end

    it "stores when the terms were accepted" do
      freeze_time do
        post "/api/v1/orders", params: order_params(shipping_method: home_delivery), as: :json

        expect(response).to have_http_status(:created)
        expect(Order.last.terms_accepted_at).to be_within(1.second).of(Time.current)
        expect(response.parsed_body.dig("data", "terms_accepted_at")).to be_present
      end
    end
  end

  describe "pickup points" do
    it "creates a locker order with its pickup point" do
      post "/api/v1/orders", params: order_params(shipping_method: locker, pickup_point: pickup_point), as: :json

      expect(response).to have_http_status(:created)
      order = Order.last
      expect(order).to have_attributes(
        pickup_point_provider: "boxnow", pickup_point_id: "BN-1234",
        pickup_point_name: "BOX NOW Konzum Ilica", pickup_point_address: "Ilica 242, 10000 Zagreb"
      )
      expect(response.parsed_body.dig("data", "pickup_point")).to eq(pickup_point.stringify_keys)
      expect(response.parsed_body.dig("data", "shipping_method", "requires_pickup_point")).to be(true)
    end

    it "returns 422 when a locker method has no pickup point" do
      expect {
        post "/api/v1/orders", params: order_params(shipping_method: locker), as: :json
      }.not_to change(Order, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Pickup point")
    end

    it "returns 422 when the pickup point has no locker code" do
      post "/api/v1/orders", params: order_params(shipping_method: locker, pickup_point: pickup_point.merge(id: "")),
                             as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 422 for an unknown provider" do
      post "/api/v1/orders", params: order_params(shipping_method: locker, pickup_point: pickup_point.merge(provider: "dhl")),
                             as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("provider")
    end

    it "accepts a pickup point without an address" do
      post "/api/v1/orders", params: order_params(shipping_method: locker, pickup_point: pickup_point.except(:address)),
                             as: :json

      expect(response).to have_http_status(:created)
      expect(Order.last.pickup_point_address).to be_nil
    end

    it "ignores a pickup point sent with home delivery" do
      post "/api/v1/orders", params: order_params(shipping_method: home_delivery, pickup_point: pickup_point), as: :json

      expect(response).to have_http_status(:created)
      expect(Order.last.pickup_point_id).to be_nil
      expect(response.parsed_body.dig("data", "pickup_point")).to be_nil
    end

    it "sends the pickup point to Stripe as metadata" do
      post "/api/v1/orders", params: order_params(shipping_method: locker, pickup_point: pickup_point), as: :json

      expect(Stripe::Checkout::Session).to have_received(:create).with(
        hash_including(metadata: hash_including(pickup_point_provider: "boxnow", pickup_point_id: "BN-1234",
                                                pickup_point_name: "BOX NOW Konzum Ilica")),
        anything
      )
    end

    it "exposes requires_pickup_point on shipping methods" do
      get "/api/v1/shipping_methods"

      methods = response.parsed_body["data"].index_by { |m| m["slug"] }
      expect(methods["pickup"]["requires_pickup_point"]).to be(true)
      expect(methods["standard"]["requires_pickup_point"]).to be(false)
    end
  end
end
