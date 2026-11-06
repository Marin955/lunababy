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

ActiveRecord::Schema[8.1].define(version: 2026_11_07_001335) do
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
    t.integer "position", default: 0, null: false
    t.uuid "product_id", null: false
    t.integer "quantity", null: false
    t.datetime "updated_at", null: false
    t.index ["bundle_id", "product_id"], name: "index_bundle_items_on_bundle_id_and_product_id", unique: true
    t.index ["bundle_id"], name: "index_bundle_items_on_bundle_id"
    t.index ["product_id"], name: "index_bundle_items_on_product_id"
  end

  create_table "bundle_price_changes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "bundle_id", null: false
    t.datetime "created_at", null: false
    t.integer "price", null: false
    t.index ["bundle_id", "created_at"], name: "index_bundle_price_changes_on_bundle_id_and_created_at"
    t.index ["bundle_id"], name: "index_bundle_price_changes_on_bundle_id"
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
    t.integer "discount_percent", default: 0, null: false
    t.string "emoji"
    t.string "image_path"
    t.string "name_en", null: false
    t.string "name_hr", null: false
    t.integer "original_price"
    t.integer "position", default: 0, null: false
    t.integer "price", null: false
    t.text "short_description_en"
    t.text "short_description_hr"
    t.string "slug", null: false
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
    t.datetime "paid_at"
    t.integer "payment_status", default: 0, null: false
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
    t.string "stripe_checkout_session_id"
    t.string "stripe_payment_intent_id"
    t.integer "subtotal", null: false
    t.integer "total", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["order_number"], name: "index_orders_on_order_number", unique: true
    t.index ["promo_code_id"], name: "index_orders_on_promo_code_id"
    t.index ["shipping_method_id"], name: "index_orders_on_shipping_method_id"
    t.index ["stripe_checkout_session_id"], name: "index_orders_on_stripe_checkout_session_id", unique: true
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "age_range_en"
    t.string "age_range_hr"
    t.string "brand"
    t.text "care_instructions_en"
    t.text "care_instructions_hr"
    t.string "certifications", default: [], null: false, array: true
    t.datetime "created_at", null: false
    t.text "description_en"
    t.text "description_hr"
    t.string "dimensions"
    t.string "image_path"
    t.integer "low_stock_threshold", default: 5, null: false
    t.text "material_en"
    t.text "material_hr"
    t.integer "msrp", default: 0, null: false
    t.string "name_en", null: false
    t.string "name_hr", null: false
    t.integer "position", default: 0, null: false
    t.integer "purchase_price", default: 0, null: false
    t.integer "purchase_price_with_vat", default: 0, null: false
    t.integer "sex", default: 0, null: false
    t.string "sku"
    t.integer "stock_quantity", default: 0, null: false
    t.string "supplier_name"
    t.string "supplier_url"
    t.datetime "updated_at", null: false
    t.index ["sku"], name: "index_products_on_sku", unique: true, where: "(sku IS NOT NULL)"
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

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.integer "language", default: 0, null: false
    t.string "name", null: false
    t.string "password_digest"
    t.string "phone"
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "admin_audit_logs", "users", column: "admin_user_id"
  add_foreign_key "bundle_items", "bundles"
  add_foreign_key "bundle_items", "products"
  add_foreign_key "bundle_price_changes", "bundles"
  add_foreign_key "oauth_identities", "users"
  add_foreign_key "order_items", "bundles"
  add_foreign_key "order_items", "orders"
  add_foreign_key "order_status_transitions", "orders"
  add_foreign_key "orders", "promo_codes"
  add_foreign_key "orders", "shipping_methods"
  add_foreign_key "orders", "users"
  add_foreign_key "shipments", "orders"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
end
