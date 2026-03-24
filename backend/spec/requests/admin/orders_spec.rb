require "rails_helper"

RSpec.describe "Admin Orders", type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:shipping) { create(:shipping_method) }

  describe "GET /admin/orders" do
    it "returns all orders for admin" do
      create_list(:order, 3, shipping_method: shipping)

      get "/admin/orders", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].length).to eq(3)
      expect(response.parsed_body["meta"]).to include("total_count")
    end

    it "filters orders by status" do
      create(:order, shipping_method: shipping, status: :pending)
      create(:order, :confirmed, shipping_method: shipping)

      get "/admin/orders", params: { status: "confirmed" }, headers: auth_headers(admin)

      expect(response.parsed_body["data"].length).to eq(1)
    end

    it "returns 403 for non-admin" do
      get "/admin/orders", headers: auth_headers(customer)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /admin/orders/:order_number" do
    it "returns order detail with items and transitions" do
      order = create(:order, :with_items, shipping_method: shipping)

      get "/admin/orders/#{order.order_number}", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body["data"]
      expect(json["order_number"]).to eq(order.order_number)
      expect(json["order_items"]).to be_an(Array)
    end

    it "returns 404 for nonexistent order" do
      get "/admin/orders/LB-00000000-XXXXX", headers: auth_headers(admin)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /admin/orders/:order_number/status" do
    it "transitions order from pending to confirmed" do
      order = create(:order, shipping_method: shipping, status: :pending)

      patch "/admin/orders/#{order.order_number}/status",
            params: { status: "confirmed" },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(order.reload.status).to eq("confirmed")
      expect(order.order_status_transitions.count).to eq(1)
    end

    it "transitions order from confirmed to processing" do
      order = create(:order, shipping_method: shipping, status: :confirmed)

      patch "/admin/orders/#{order.order_number}/status",
            params: { status: "processing" },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(order.reload.status).to eq("processing")
    end

    it "rejects invalid status transition" do
      order = create(:order, shipping_method: shipping, status: :pending)

      patch "/admin/orders/#{order.order_number}/status",
            params: { status: "shipped" },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("Invalid status transition")
    end

    it "allows cancellation from pending" do
      order = create(:order, shipping_method: shipping, status: :pending)

      patch "/admin/orders/#{order.order_number}/status",
            params: { status: "cancelled", cancellation_reason: "Customer request" },
            headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      expect(order.reload.status).to eq("cancelled")
    end
  end

  describe "POST /admin/orders/:order_number/shipment" do
    it "creates shipment and transitions to shipped" do
      order = create(:order, shipping_method: shipping, status: :processing)

      post "/admin/orders/#{order.order_number}/shipment",
           params: { carrier: "gls", tracking_number: "GLS987654321" },
           headers: auth_headers(admin)

      expect(response).to have_http_status(:created)
      expect(order.reload.status).to eq("shipped")
      expect(order.shipment.tracking_number).to eq("GLS987654321")
      expect(order.shipment.carrier).to eq("gls")
    end

    it "rejects duplicate shipment" do
      order = create(:order, :shipped, shipping_method: shipping)

      post "/admin/orders/#{order.order_number}/shipment",
           params: { carrier: "dpd", tracking_number: "DPD111111" },
           headers: auth_headers(admin)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["error"]).to include("already exists")
    end
  end
end
