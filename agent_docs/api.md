# API Reference

Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)

## Response Formats

```json
// Single resource
{ "data": { ...resource } }

// Collection
{ "data": [ ...resources ] }

// Paginated collection
{ "data": [ ...resources ], "meta": { "current_page": 1, "total_pages": 5, "total_count": 100 } }

// Validation error (422)
{ "errors": { "field": ["message"] } }

// General error (400/401/403/404)
{ "error": "Error message" }
```

## Authentication

All authenticated requests use: `Authorization: Bearer <access_token>`

### Token Flow
1. Login/register/OAuth returns `{ data: { token, refresh_token, user } }`
2. Access token: 15min expiry, stored in memory only
3. Refresh token: 30day expiry, stored in localStorage
4. On 401: frontend calls `POST /api/v1/auth/refresh` with refresh_token
5. If refresh fails: user is signed out

### POST /api/v1/auth/register
```json
// Request
{ "name": "...", "email": "...", "password": "..." }
// Response 201
{ "data": { "token": "jwt...", "refresh_token": "jwt...", "user": { ...UserSerializer } } }
```

### POST /api/v1/auth/login
```json
// Request
{ "email": "...", "password": "..." }
// Response 200 (same shape as register)
```

### POST /api/v1/auth/google
```json
// Request
{ "credential": "google-id-token" }
// Response 200 (same shape as register)
```

### POST /api/v1/auth/facebook
```json
// Request
{ "access_token": "facebook-access-token" }
// Response 200 (same shape as register)
```

### POST /api/v1/auth/refresh
```json
// Request
{ "refresh_token": "jwt..." }
// Response 200 (same shape as register — new token pair)
```

### DELETE /api/v1/auth/session
Authenticated. No-op server-side (JWT is stateless). Returns 200.

## Public Endpoints

### GET /api/v1/bundles?locale=hr
Returns active bundles ordered by position.
```json
{ "data": [{
  "id": "uuid", "slug": "sleep-bundle", "name": "Localized name",
  "short_description": "...", "price": 8990, "original_price": null,
  "discount_percent": 0, "badge": "popular", "category": "sleep",
  "emoji": "...", "color_from": "#...", "color_to": "#...", "in_stock": true
}] }
```

### GET /api/v1/bundles/:slug?locale=hr
Returns bundle with items.
```json
{ "data": {
  ...BundleSerializer,
  "description": "...",
  "items": [{ "name": "...", "description": "...", "quantity": 1 }]
} }
```

### GET /api/v1/shipping_methods?locale=hr
```json
{ "data": [{
  "id": "uuid", "slug": "standard", "name": "...", "carrier": "Hrvatska Pošta",
  "description": "...", "price": 350, "estimated_days": "3-5",
  "free_threshold": 5000
}] }
```

### POST /api/v1/promo_codes/validate
```json
// Request
{ "code": "LUNA10", "cart_total": 8990, "locale": "hr" }
// Response 200 (valid)
{ "data": { "code": "LUNA10", "valid": true, "discount_type": "percentage", "value": 10, "discount_amount": 899, "label": "..." } }
// Response 200 (invalid)
{ "data": { "code": "INVALID", "valid": false, "reason": "Promo kod ne postoji" } }
```

### POST /api/v1/newsletter/subscribe
```json
// Request
{ "email": "user@example.com", "language": "hr" }
// Response 201
{ "data": { "message": "..." } }
```

## Order Endpoints

### POST /api/v1/orders
Mixed auth (guest or authenticated). If authenticated, auto-associates to user.
```json
// Request
{
  "customer_email": "user@example.com",
  "customer_name": "Name",
  "shipping_method_id": "uuid",
  "promo_code": "LUNA10",        // optional
  "language": "hr",
  "note": "...",                  // optional
  "save_address": true,           // optional, auth only
  "shipping_address": {
    "first_name": "...", "last_name": "...",
    "street": "...", "city": "...", "postal_code": "...",
    "phone": "...", "company": "..."
  },
  "items": [
    { "bundle_id": "uuid", "quantity": 2 }
  ]
}
// Response 201
{ "data": { ...OrderSerializer } }
```

### GET /api/v1/orders?page=1&locale=hr
Authenticated. Returns current user's orders (paginated, newest first).

### GET /api/v1/orders/:order_number?email=...&locale=hr
Returns order if user is owner or email matches.

### GET /api/v1/orders/:order_number/lookup?email=...
Guest order lookup by order number + email.

## Profile Endpoints (authenticated)

### GET /api/v1/profile
```json
{ "data": { "id": "uuid", "name": "...", "email": "...", "phone": "...", "language": "hr", "role": "customer", "addresses": [...] } }
```

### PATCH /api/v1/profile
```json
{ "name": "...", "phone": "...", "language": "en" }
```

### POST /api/v1/profile/addresses
```json
{ "first_name": "...", "last_name": "...", "street": "...", "city": "...", "postal_code": "...", "phone": "...", "company": "...", "is_default": true }
```

### PATCH/DELETE /api/v1/profile/addresses/:id
Same shape for PATCH. DELETE returns 204.

## Admin Endpoints (admin role required)

### GET /admin/dashboard
```json
{ "data": {
  "total_orders": 42,
  "orders_by_status": { "pending": 5, "confirmed": 3, ... },
  "revenue_total": 150000,
  "recent_orders": [...],
  "low_stock_bundles": [...]
} }
```

### GET /admin/orders?page=1&status=pending&search=...&date_from=...&date_to=...
Paginated, filterable order list.

### GET /admin/orders/:order_number
Order with items, shipment, and status transitions.

### PATCH /admin/orders/:order_number/status
```json
{ "status": "confirmed", "note": "Optional note", "cancellation_reason": "..." }
```
Enforces valid transitions. Creates OrderStatusTransition. Enqueues status email.

### POST /admin/orders/:order_number/shipment
```json
{ "carrier": "gls", "tracking_number": "...", "shipped_at": "2026-03-25T10:00:00Z", "estimated_delivery_at": "2026-03-28" }
```
Auto-transitions order to "shipped". Enqueues shipped email.

### GET /admin/bundles
All bundles with items (ordered by position).

### PATCH /admin/bundles/:id
```json
{ "stock_quantity": 50, "active": true, "price": 8990, "original_price": 9990, "discount_percent": 10, "badge": "sale", ... }
```

### GET/POST/PATCH /admin/promo_codes
Standard CRUD for promo codes.

## Frontend API Client (`src/services/api/client.ts`)

```typescript
import { api } from '@/services/api/client';

// Auto-prefixes /api/v1 for all paths (except /admin/)
const bundles = await api.get<Bundle[]>('/bundles?locale=hr');
const order = await api.post<Order>('/orders', body);

// Admin routes: /admin/ prefix detected, no /api/v1 added
const dashboard = await api.get('/admin/dashboard', { token });

// Custom ApiError class
try { ... } catch (e) {
  if (e instanceof ApiError) {
    e.status;   // HTTP status code
    e.message;  // Error message
    e.errors;   // Validation errors object
  }
}
```

Token injection: pass `{ token }` in options, or it auto-reads from auth store for admin routes.
