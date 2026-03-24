# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_24_000016) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "addresses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "city", null: false
    t.string "company"
    t.datetime "created_at", null: false
    t.string "first_name", null: false
    t.boolean "is_default", default: false, null: false
    t.string "last_name", null: false
    t.string "phone"
    t.string "postal_code", null: false
    t.string "street", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "admin_audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "action", null: false
    t.uuid "admin_user_id", null: false
    t.jsonb "change_data", default: {}
    t.datetime "created_at", null: false
    t.uuid "target_id"
    t.string "target_type"
    t.index ["admin_user_id"], name: "index_admin_audit_logs_on_admin_user_id"
    t.index ["target_type", "target_id"], name: "index_admin_audit_logs_on_target_type_and_target_id"
  end

  create_table "bundle_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "bundle_id", null: false
    t.datetime "created_at", null: false
    t.text "description_en"
    t.text "description_hr"
    t.string "name_en", null: false
    t.string "name_hr", null: false
    t.integer "position", default: 0, null: false
    t.integer "quantity", null: false
    t.datetime "updated_at", null: false
    t.index ["bundle_id"], name: "index_bundle_items_on_bundle_id"
  end

  create_table "bundles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.integer "badge"
    t.string "category"
    t.string "color_from"
    t.string "color_to"
    t.datetime "created_at", null: false
    t.text "description_en"
    t.text "description_hr"
    t.string "emoji"
    t.integer "low_stock_threshold", default: 5, null: false
    t.string "name_en", null: false
    t.string "name_hr", null: false
    t.integer "original_price"
    t.integer "position", default: 0, null: false
    t.integer "price", null: false
    t.text "short_description_en"
    t.text "short_description_hr"
    t.string "slug", null: false
    t.integer "stock_quantity", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_bundles_on_slug", unique: true
  end

  create_table "newsletter_subscribers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.integer "language", default: 0, null: false
    t.datetime "subscribed_at"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_newsletter_subscribers_on_email", unique: true
  end

  create_table "oauth_identities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "access_token"
    t.datetime "created_at", null: false
    t.integer "provider", null: false
    t.string "provider_uid", null: false
    t.string "refresh_token"
    t.datetime "token_expires_at"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["provider", "provider_uid"], name: "index_oauth_identities_on_provider_and_provider_uid", unique: true
    t.index ["user_id"], name: "index_oauth_identities_on_user_id"
  end

  create_table "order_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "bundle_id", null: false
    t.string "bundle_name", null: false
    t.datetime "created_at", null: false
    t.integer "line_total", null: false
    t.uuid "order_id", null: false
    t.integer "quantity", null: false
    t.integer "unit_price", null: false
    t.index ["bundle_id"], name: "index_order_items_on_bundle_id"
    t.index ["order_id"], name: "index_order_items_on_order_id"
  end

  create_table "order_status_transitions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "from_status"
    t.text "note"
    t.uuid "order_id", null: false
    t.integer "to_status", null: false
    t.index ["order_id"], name: "index_order_status_transitions_on_order_id"
  end

  create_table "orders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "cancellation_reason"
    t.datetime "created_at", null: false
    t.string "customer_email", null: false
    t.string "customer_name", null: false
    t.integer "discount_amount", default: 0, null: false
    t.integer "language", default: 0, null: false
    t.text "note"
    t.string "order_number", null: false
    t.uuid "promo_code_id"
    t.string "shipping_city", null: false
    t.string "shipping_company"
    t.integer "shipping_cost", null: false
    t.string "shipping_first_name", null: false
    t.string "shipping_last_name", null: false
    t.uuid "shipping_method_id", null: false
    t.string "shipping_phone"
    t.string "shipping_postal_code", null: false
    t.string "shipping_street", null: false
    t.integer "status", default: 0, null: false
    t.integer "subtotal", null: false
    t.integer "total", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["order_number"], name: "index_orders_on_order_number", unique: true
    t.index ["promo_code_id"], name: "index_orders_on_promo_code_id"
    t.index ["shipping_method_id"], name: "index_orders_on_shipping_method_id"
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "promo_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.integer "current_use_count", default: 0, null: false
    t.integer "discount_type", null: false
    t.datetime "expires_at"
    t.string "label_en"
    t.string "label_hr"
    t.integer "max_uses"
    t.integer "min_order_amount"
    t.datetime "updated_at", null: false
    t.integer "value"
    t.index ["code"], name: "index_promo_codes_on_code", unique: true
  end

  create_table "shipments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "carrier", null: false
    t.datetime "created_at", null: false
    t.date "estimated_delivery_at"
    t.uuid "order_id", null: false
    t.datetime "shipped_at"
    t.string "tracking_number"
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_shipments_on_order_id", unique: true
  end

  create_table "shipping_methods", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "carrier"
    t.datetime "created_at", null: false
    t.text "description_en"
    t.text "description_hr"
    t.string "estimated_days"
    t.integer "free_threshold"
    t.string "name_en", null: false
    t.string "name_hr", null: false
    t.integer "position", default: 0, null: false
    t.integer "price", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_shipping_methods_on_slug", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.integer "language", default: 0, null: false
    t.string "name", null: false
    t.string "phone"
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "admin_audit_logs", "users", column: "admin_user_id"
  add_foreign_key "bundle_items", "bundles"
  add_foreign_key "oauth_identities", "users"
  add_foreign_key "order_items", "bundles"
  add_foreign_key "order_items", "orders"
  add_foreign_key "order_status_transitions", "orders"
  add_foreign_key "orders", "promo_codes"
  add_foreign_key "orders", "shipping_methods"
  add_foreign_key "orders", "users"
  add_foreign_key "shipments", "orders"
end
