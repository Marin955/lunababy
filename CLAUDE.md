# LunaBaby Development Guidelines

Baby product e-commerce webshop (Croatian market, bilingual HR/EN).

## Tech Stack

- **Frontend**: Next.js 15.3 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand 5 + next-intl 4.8
- **Backend**: Rails 8.1 API-only + Alba serialization + custom JWT auth + Solid Queue
- **Database**: PostgreSQL 16+ (Supabase in prod with transaction pooler)
- **Deployment**: Vercel (frontend) + Render (backend) + Supabase (DB)

## Project Structure

```
├── src/                    # Next.js frontend (root of repo)
│   ├── app/[locale]/       # App Router pages (hr default, en)
│   ├── components/         # React components by domain
│   ├── services/api/       # Backend API client wrappers
│   ├── stores/             # Zustand stores (auth, cart)
│   ├── types/              # Shared TypeScript types
│   ├── i18n/               # next-intl config
│   └── lib/                # Utilities (formatPrice, cn)
├── backend/                # Rails API backend
│   ├── app/controllers/    # API v1 + Admin controllers
│   ├── app/models/         # 13 ActiveRecord models
│   ├── app/serializers/    # 10 Alba serializers
│   ├── app/services/       # OrderCreation, PromoCodeValidator, OAuthAuthenticator
│   ├── app/jobs/           # Email jobs (Solid Queue)
│   └── spec/               # RSpec request specs (102 examples)
├── messages/               # i18n JSON files (hr.json, en.json)
├── specs/                  # Feature specifications (001, 002, 003)
└── agent_docs/             # Detailed docs for AI agents
```

## Commands

### Frontend
```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript check (tsc --noEmit)
```

### Backend
```bash
cd backend
bin/rails server -p 3001           # API server
bundle exec rspec                  # Run all tests (102 examples)
bundle exec rspec --format doc     # Verbose test output
bin/rails db:migrate               # Run migrations
bin/rails db:seed                  # Seed data (7 bundles, 3 shipping, 3 promos, 1 admin)
bin/rails solid_queue:start        # Background job worker
```

## Critical Rules

### Money
- **ALL monetary values are INTEGER CENTS** (e.g., 8990 = €89.90)
- Frontend `formatPrice()` divides by 100 and formats per locale
- Never use floats for money anywhere in the stack

### i18n
- Separate DB columns for each language: `name_hr`, `name_en` (NOT JSONB)
- API returns pre-localized strings via `?locale=hr|en` query param
- Frontend uses next-intl: server components use `getTranslations()`, client uses `useTranslations()`
- Default locale is `hr`, secondary is `en`

### Auth
- Custom JWT (no Devise): 15min access token + 30day refresh token
- Access token stored in **memory only** (not persisted to localStorage)
- Refresh token persisted to localStorage
- On page reload: refresh token exchanges for new access token
- `useAuthStore.persist` calls MUST be guarded with `typeof window !== 'undefined'` (SSR crashes otherwise)

### Database
- UUID primary keys on all tables
- Prepared statements disabled (Supabase transaction pooler requirement)
- Pessimistic locking used during order creation for stock management

### Serialization (Alba 3.x)
- Use `many :items, resource: ItemSerializer` for has_many (NOT `association`)
- `root_key` unreliable for collections — wrap in controller instead
- All serializers accept `params[:locale]` for localized field selection

### Rails Conventions
- `OAuthAuthenticator` → file: `o_auth_authenticator.rb` (Rails autoloading)
- `AdminAuditLog.change_data` (renamed from `changes` — ActiveRecord conflict)
- Order numbers auto-generated: `LB-YYYYMMDD-XXXXX`
- `before_validation on: :create` for order number generation (not `before_create`)

### Frontend Patterns
- Server Components for public pages (shop, detail) with `force-dynamic`
- Client Components for interactive pages (cart, checkout, profile, admin)
- `useSearchParams()` must be wrapped in `<Suspense>` (Next.js 15 requirement)
- Cart stores only bundleId + quantity; prices fetched from API at display time
- Promo codes revalidated on mount in both cart and checkout pages

### Zsh Shell
- Quote paths with brackets: `git add "src/app/[locale]/..."` (zsh glob)
- Quote URLs with `?`: `curl "http://...?param=val"`

## Agent Documentation

Detailed reference docs are in `agent_docs/`:
- **[frontend.md](agent_docs/frontend.md)** — Routes, components, stores, types, services, i18n
- **[backend.md](agent_docs/backend.md)** — Models, controllers, serializers, services, jobs, routes
- **[api.md](agent_docs/api.md)** — All API endpoints, request/response formats, auth flow
- **[testing.md](agent_docs/testing.md)** — Running tests, factories, test helpers, dev workflow
- **[playwright.md](agent_docs/playwright.md)** — Using Playwright MCP for browser testing
