# Backend Architecture (Rails 8.1 API)

## Models (13 + ApplicationRecord)

### User
- `has_many :oauth_identities, :addresses, :orders, :admin_audit_logs`
- Enums: `role` (customer=0, admin=1), `language` (hr=0, en=1)
- `has_secure_password validations: false` (custom: min 8 chars)
- Validates: name presence, email presence+uniqueness+format

### Bundle
- `has_many :bundle_items` (dependent: destroy), `has_many :order_items` (restrict)
- Enum: `badge` (new=0, popular=1, sale=2) with prefix `badge_`
- Validates: slug uniqueness, name_hr/name_en presence, price >= 0, discount_percent 0..100
- Callback: `before_validation :apply_discount` — computes price from original_price × (1 - discount_percent/100)
- Scopes: `active`, `in_stock`

### BundleItem
- `belongs_to :bundle`, default scope: `order(:position)`
- Localized: name_hr/name_en, description_hr/description_en

### Order
- `belongs_to :user` (optional), `:shipping_method`, `:promo_code` (optional)
- `has_many :order_items`, `has_one :shipment`, `has_many :order_status_transitions`
- Enum: `status` (pending=0..refunded=6), `language` (hr=0, en=1)
- Callback: `before_validation :generate_order_number` on create — format `LB-YYYYMMDD-XXXXX`
- All monetary fields: subtotal, discount_amount, shipping_cost, total (integer cents)

### OrderItem
- `belongs_to :order, :bundle`
- Snapshot fields: bundle_name, unit_price, line_total (cents)
- quantity: 1..10

### ShippingMethod
- Localized: name_hr/name_en, description_hr/description_en
- Fields: price (cents), free_threshold (cents, nullable), carrier, estimated_days
- Scope: `active` (ordered by position)

### PromoCode
- Enum: `discount_type` (percentage=0, fixed=1, free_shipping=2)
- Callback: `before_validation :upcase_code`
- Method: `valid_for_use?(cart_total)` — checks active, expires_at, max_uses, min_order_amount

### Shipment
- `belongs_to :order` (unique)
- Enum: `carrier` (hrvatska_posta=0, gls=1, dpd=2)
- Method: `tracking_url` — generates carrier-specific tracking URL

### Other Models
- **OAuthIdentity**: provider (google=0, facebook=1) + provider_uid, belongs_to user
- **Address**: belongs_to user, callback ensures single default per user
- **OrderStatusTransition**: from_status/to_status enums (0-6)
- **AdminAuditLog**: action, target_type/id, change_data (jsonb)
- **NewsletterSubscriber**: email, language, active, subscribed_at

## Controllers

### Concerns
- **Authenticatable**: JWT encode/decode, `authenticate_user!`, `current_user`, `encode_jwt(user)` (15min), `encode_refresh_token(user)` (30day)
- **AdminAuthorizable**: `require_admin!` (calls authenticate_user! + role check)
- **Paginatable**: `paginate(scope)` returns [records, meta], default 20 per page
- **Auditable**: `audit_log!(action:, target:, changes:)` creates AdminAuditLog

### API::V1 Controllers

**AuthController** — register, login, google, facebook, refresh, destroy (session)
- OAuth: frontend sends provider token, backend verifies and creates/finds user
- Uses OAuthAuthenticator service

**BundlesController** — index (active, with items), show (by slug, with items)

**OrdersController** — index (auth, paginated), show (auth or email match), create (guest+auth), lookup (by number+email)
- Uses OrderCreationService

**ProfileController** — show, update (name, phone, language)

**Profile::AddressesController** — create, update, destroy

**ShippingMethodsController** — index (active)

**PromoCodesController** — validate (uses PromoCodeValidator service)

**NewsletterController** — subscribe

### Admin Controllers (all require admin role)

**DashboardController** — stats: total_orders, orders_by_status, revenue_total, recent_orders, low_stock

**OrdersController** — index (filterable: status, date_from/to, search), show (with items/shipment/transitions), status (with valid transition enforcement), shipment (creates + auto-sets shipped status)

**BundlesController** — index, update (stock, price, discount_percent, active, etc.)

**PromoCodesController** — index, create, update

## Services

### OrderCreationService
Transaction-wrapped workflow:
1. Lock bundles (pessimistic), validate stock
2. Calculate subtotal from bundle prices
3. Validate promo code (if provided)
4. Calculate discount, shipping (free_threshold + free_shipping promo)
5. Create order + order_items
6. Decrement stock, increment promo usage
7. Save address if authenticated + save_address flag
8. Enqueue confirmation email

### PromoCodeValidator
Validates code against cart_total. Checks: exists, active, not expired, max_uses, min_order_amount.
Returns: `{ code, valid, discount_type, value, discount_amount, label }` or `{ valid: false, reason }`

### OAuthAuthenticator
`find_or_create_user_from_oauth(provider:, uid:, email:, name:)` — transaction-safe user creation/lookup via OAuthIdentity.

## Jobs (Solid Queue, PostgreSQL-backed)

- **SendOrderConfirmationJob** — `OrderMailer.confirmation(order).deliver_now`
- **SendOrderStatusUpdateJob** — ships `OrderMailer.shipped` or `.status_update` based on status

## Mailers

**OrderMailer** (from: ENV["SMTP_FROM"] || "noreply@lunababy.eu"):
- `confirmation(order)` — order summary email
- `status_update(order)` — status change notification
- `shipped(order)` — tracking info email

All templates are bilingual (HR/EN) based on order language.

## Routes Summary

```
# Health
GET  /up, /health

# Public API
GET  /api/v1/bundles
GET  /api/v1/bundles/:slug
GET  /api/v1/shipping_methods
POST /api/v1/promo_codes/validate
POST /api/v1/newsletter/subscribe

# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/auth/facebook
POST   /api/v1/auth/refresh
DELETE /api/v1/auth/session

# Orders (mixed auth)
GET  /api/v1/orders              # authenticated
GET  /api/v1/orders/:number      # auth or email match
POST /api/v1/orders              # guest or authenticated
GET  /api/v1/orders/:number/lookup  # guest by email

# Profile (authenticated)
GET    /api/v1/profile
PATCH  /api/v1/profile
POST   /api/v1/profile/addresses
PATCH  /api/v1/profile/addresses/:id
DELETE /api/v1/profile/addresses/:id

# Admin (admin role)
GET   /admin/dashboard
GET   /admin/orders
GET   /admin/orders/:number
PATCH /admin/orders/:number/status
POST  /admin/orders/:number/shipment
GET   /admin/bundles
PATCH /admin/bundles/:id
GET   /admin/promo_codes
POST  /admin/promo_codes
PATCH /admin/promo_codes/:id
```

## Serializers (Alba 3.x)

| Serializer | Localized Fields | Notes |
|-----------|-----------------|-------|
| BundleSerializer | name, short_description | Includes computed: badge, in_stock |
| BundleDetailSerializer | + description | Includes items via BundleItemSerializer |
| BundleItemSerializer | name, description | |
| ShippingMethodSerializer | name, description | |
| PromoCodeSerializer | label | |
| OrderSerializer | — | Complex: includes address, items, shipping_method, promo_code, shipment |
| UserSerializer | — | Includes addresses |
| AddressSerializer | — | |
| ShipmentSerializer | — | Includes computed tracking_url |

## Rate Limiting (Rack::Attack)

- Global: 300 req / 5 min per IP
- Auth endpoints: 5 req / min per IP
- Order creation: 10 req / hour per IP
- Promo validation: 20 req / min per IP
- Newsletter: 3 req / hour per IP

## Order Status Transitions (enforced)

```
pending    → confirmed, cancelled
confirmed  → processing, cancelled
processing → shipped, cancelled
shipped    → delivered
delivered  → refunded
cancelled  → (none)
refunded   → (none)
```

## Environment Variables

```bash
DATABASE_URL=postgresql://localhost:5432/lunababy_development
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@lunababy.eu
ADMIN_PASSWORD=admin123!
# Production only:
SMTP_ADDRESS=smtp.resend.com
SMTP_PORT=587
SMTP_USERNAME=resend
SMTP_PASSWORD=your_resend_api_key
SMTP_FROM=noreply@lunababy.eu
MAILER_HOST=api.lunababy.eu
```

## Seed Data

- 1 admin user (ADMIN_EMAIL/ADMIN_PASSWORD)
- 3 shipping methods: standard (3.50€, free>50€), express (5.99€), pickup (2.50€, free>50€)
- 3 promo codes: LUNA10 (10%), BEBA20 (20€ off, min 50€), FREESHIP (free shipping)
- 7 bundles with 30 items total (prices 54.90€–139.90€)
