# Frontend Architecture

## Page Routes (src/app/[locale]/)

### Public
| Route | Component Type | Description |
|-------|---------------|-------------|
| `/` | Server | Homepage (hero, categories, featured bundles, newsletter) |
| `/shop/` | Server (`force-dynamic`) | Bundle listing grid |
| `/shop/[slug]/` | Server (`force-dynamic`) | Bundle detail with items |
| `/cart/` | Client | Shopping cart with promo codes |
| `/checkout/` | Client | Checkout form + order summary |
| `/order-confirmation/` | Client | Post-purchase confirmation |
| `/order-lookup/` | Client | Guest order tracking by email |
| `/about/` | Static | About page |
| `/contact/` | Client | Contact form |
| `/faq/` | Client | FAQ accordion |
| `/shipping-info/` | Static | Shipping policy |
| `/returns/` | Static | Return policy |
| `/privacy/` | Static | Privacy policy |
| `/signin/` | Client | Login (email + Google + Facebook) |
| `/register/` | Client | Registration |

### Protected (AuthGuard)
| Route | Description |
|-------|-------------|
| `/profile/` | Edit name, phone, language |
| `/profile/addresses/` | Address CRUD |
| `/profile/orders/` | Order history |

### Admin (AdminGuard, role: admin)
| Route | Description |
|-------|-------------|
| `/admin/` | Dashboard (stats, recent orders, low stock) |
| `/admin/orders/` | Order management with filters |
| `/admin/orders/[order_number]/` | Order detail + status updates + shipments |
| `/admin/bundles/` | Inventory: price, discount %, stock, active |
| `/admin/promo-codes/` | Promo code CRUD |

## Components by Domain

### Layout (`src/components/layout/`)
- **Header.tsx** — Fixed header, desktop nav, auth links, cart icon, language switcher, mobile hamburger
- **Footer.tsx** — Links, social icons, newsletter
- **LanguageSwitcher.tsx** — HR/EN toggle (inline-flex pill)
- **MobileMenu.tsx** — Slide-in drawer with all nav + auth + cart + language

### Bundles (`src/components/bundles/`)
- **BundleGrid.tsx** — Responsive grid wrapper
- **BundleCard.tsx** — Product card: emoji, gradient, badge, price, discount badge, add-to-cart
- **BundleItemList.tsx** — "What's included" checklist
- **AddToCartButton.tsx** — Add to cart with success animation

### Cart (`src/components/cart/`)
- **CartIcon.tsx** — Header icon with animated badge on add
- **CartItem.tsx** — Line item with quantity +/- controls, shows original price strikethrough if discounted
- **CartSummary.tsx** — Full price → bundle savings → promo discount → shipping → total
- **PromoCodeInput.tsx** — Code input with validation against API

### Checkout (`src/components/checkout/`)
- **CheckoutForm.tsx** — Address/contact form, creates order via API
- **OrderSummary.tsx** — Mirrors CartSummary structure (full price → savings → promo → shipping → total)
- **SavedAddressSelector.tsx** — Dropdown of user's saved addresses (auth only)
- **ShippingSelector.tsx** — Radio buttons for shipping methods, fetches from API

### Admin (`src/components/admin/`)
- **AdminNav.tsx** — Tab navigation
- **DashboardStats.tsx** — Revenue & order count cards
- **RecentOrdersTable.tsx** — Last 5 orders
- **LowStockAlerts.tsx** — Bundles below threshold
- **AdminOrdersTable.tsx** — Paginated, filterable order list
- **AdminBundlesTable.tsx** — Editable: price (EUR input), discount %, computed sale price, stock, active
- **AdminPromoTable.tsx** — Promo code list
- **PromoCodeForm.tsx** — Create/edit promo code
- **StatusTransitionButton.tsx** — Order status updater with valid transitions
- **CreateShipmentForm.tsx** — Add tracking info to orders

### Auth (`src/components/auth/`)
- **AuthGuard.tsx** — Redirects unauthenticated to /signin
- **AdminGuard.tsx** — Redirects non-admin to /
- **GoogleSignInButton.tsx** — Google OAuth (sends ID token to backend)
- **FacebookLoginButton.tsx** — Facebook OAuth (sends access token to backend)

### Home (`src/components/home/`)
- HeroSection, Categories, FeaturedBundles, WhyLunaBaby, Newsletter

### UI Primitives (`src/components/ui/`)
- **Button.tsx** — Polymorphic (button/link), variants: primary/secondary/outline, sizes: sm/md/lg
- **Input.tsx** — Text/email/textarea with label and error display
- **Badge.tsx** — New/Popular/Sale badges
- **Card.tsx** — Generic card wrapper

## Zustand Stores

### Auth Store (`src/stores/auth-store.ts`)
```typescript
// State
user: User | null
token: string | null        // Memory only (NOT persisted)
refreshToken: string | null // Persisted to localStorage
isAuthenticated: boolean

// Actions
signIn(token, refreshToken, user)
signOut()
setUser(user)
getToken(): string | null
```
- localStorage key: `lunababy-auth`
- On mount: auto-refreshes access token from refresh token
- On 401: triggers token refresh via `setTokenRefresher` callback
- SSR guard: `typeof window !== 'undefined'` on persist API calls

### Cart Store (`src/stores/cart-store.ts`)
```typescript
// State
items: { bundleId: string, quantity: number }[]
promoCode: string | null
isHydrated: boolean

// Actions
addItem(bundleId)          // Max qty: 10
removeItem(bundleId)
updateQuantity(bundleId, qty) // 0 = remove
applyPromo(code)
removePromo()
clearCart()
setHydrated(bool)
```
- localStorage key: `lunababy-cart`, version: 1
- Prices NOT stored — fetched from API at display time

## API Services (`src/services/api/`)

| File | Endpoints Called |
|------|----------------|
| `client.ts` | Base fetch wrapper, auto `/api/v1` prefix, token injection, 401 refresh |
| `auth.ts` | login, register, google, facebook, refresh |
| `bundles.ts` | GET bundles, GET bundles/:slug |
| `orders.ts` | POST orders, GET orders, GET orders/:num, GET orders/:num/lookup |
| `shipping.ts` | GET shipping_methods |
| `promo-codes.ts` | POST promo_codes/validate |
| `profile.ts` | GET/PATCH profile, POST/PATCH/DELETE profile/addresses |
| `newsletter.ts` | POST newsletter/subscribe |
| `admin.ts` | Dashboard, orders (list/show/status/shipment), bundles, promo_codes |

## Cart/Checkout Pricing Logic (`src/services/cart-service.ts`)

```
fullPrice = subtotal + bundleSavings     (original prices × quantities)
subtotal = sum(bundle.price × quantity)  (already-discounted prices)
bundleSavings = sum((original_price - price) × quantity)
promoDiscount = calculateDiscount(subtotal, promoValidation)
shipping = calculateShipping(subtotal, selectedMethod, promoValidation)
total = subtotal - promoDiscount + shipping
```

Display order in CartSummary/OrderSummary:
1. Original price (fullPrice)
2. Bundle savings (-bundleSavings)
3. Promo discount (-promoDiscount)
4. Shipping
5. **Total**

## Types (`src/types/index.ts`)

Key types: `Bundle`, `BundleDetail`, `BundleItem`, `CartItem`, `PromoValidation`, `ShippingMethod`, `Order`, `OrderItem`, `OrderStatus`, `User`, `Address`, `AuthData`, `Shipment`, `ShippingAddress`

All monetary fields are **integer cents**.

## i18n Setup

- Config: `src/i18n/routing.ts` (locales: hr, en; default: hr)
- Navigation: `src/i18n/navigation.ts` (typed Link, useRouter, usePathname, redirect)
- Server loader: `src/i18n/request.ts`
- Messages: `messages/hr.json`, `messages/en.json` (~744 lines each)
- Usage: `useTranslations('namespace')` in client, `getTranslations('namespace')` in server

## Styling

- Tailwind CSS 4 with custom theme in `src/app/globals.css`
- Custom colors: cream, teal, teal-deep, teal-pale, lavender, gold, peach, blush
- Custom fonts: Playfair Display (headings), Quicksand (body) — loaded via Google Fonts in layout
- Border radius tokens: `--radius-sm` (12px), `--radius-md` (16px), `--radius-lg` (24px), `--radius-xl` (32px)
- No tailwind.config.ts — uses CSS-based Tailwind 4 configuration

## Environment Variables (Frontend)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```
