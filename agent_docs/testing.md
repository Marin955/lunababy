# Testing & Development Workflow

## Backend Tests (RSpec)

### Setup
```bash
cd backend
bundle install
bin/rails db:create db:migrate RAILS_ENV=test
```

### Running Tests
```bash
bundle exec rspec                              # All tests (102 examples)
bundle exec rspec --format documentation       # Verbose output
bundle exec rspec spec/requests/api/v1/        # API tests only
bundle exec rspec spec/requests/admin/         # Admin tests only
bundle exec rspec spec/requests/discount_flow_spec.rb  # Specific file
```

### Test Structure
```
backend/spec/
├── spec_helper.rb
├── rails_helper.rb
├── support/
│   └── auth_helpers.rb          # JWT token generation for tests
├── factories/
│   ├── users.rb                 # traits: :admin
│   ├── bundles.rb               # traits: :with_items, :out_of_stock, :inactive, :on_sale, :discounted
│   ├── bundle_items.rb
│   ├── shipping_methods.rb
│   ├── promo_codes.rb           # traits: :fixed, :free_shipping, :expired, :inactive, :maxed_out
│   ├── orders.rb                # traits: :with_items, :confirmed, :shipped
│   ├── shipments.rb
│   ├── addresses.rb
│   └── newsletter_subscribers.rb
└── requests/
    ├── api/v1/
    │   ├── bundles_spec.rb
    │   ├── shipping_methods_spec.rb
    │   ├── promo_codes_spec.rb
    │   ├── newsletter_spec.rb
    │   ├── auth_spec.rb
    │   ├── orders_spec.rb
    │   ├── profile_spec.rb
    │   └── addresses_spec.rb
    ├── admin/
    │   ├── dashboard_spec.rb
    │   ├── orders_spec.rb
    │   ├── bundles_spec.rb
    │   └── promo_codes_spec.rb
    └── discount_flow_spec.rb    # End-to-end discount integration tests
```

### Auth Helper Usage
```ruby
# In spec files:
include AuthHelpers

let(:user) { create(:user) }
let(:admin) { create(:user, :admin) }
let(:token) { auth_token_for(user) }
let(:admin_token) { auth_token_for(admin) }

# Usage in requests:
get "/api/v1/orders", headers: { "Authorization" => "Bearer #{token}" }
```

### Factory Examples
```ruby
# Basic
create(:bundle)
create(:bundle, :with_items)
create(:bundle, :discounted, discount_percent: 20)
create(:bundle, :out_of_stock)

create(:user, :admin)
create(:promo_code, :fixed, value: 2000)  # 20€ off
create(:promo_code, :free_shipping)
create(:promo_code, :expired)

create(:order, :with_items, :confirmed)
create(:order, :shipped)
```

### Test Libraries
- **rspec-rails** 8.0.4 — test framework
- **factory_bot_rails** 6.5.1 — test data factories
- **webmock** 3.26.2 — HTTP request stubbing (disables external calls except localhost)

## Frontend Checks

No test framework currently configured. Available checks:

```bash
npm run lint           # ESLint (next lint)
npm run type-check     # TypeScript (tsc --noEmit)
npm run build          # Full production build (catches SSR issues)
```

## Development Workflow

### Starting Both Services
```bash
# Terminal 1: Backend
cd backend && bin/rails server -p 3001

# Terminal 2: Frontend
npm run dev

# Terminal 3 (optional): Background jobs
cd backend && bin/rails solid_queue:start
```

### Database Operations
```bash
cd backend
bin/rails db:create                    # Create databases
bin/rails db:migrate                   # Run pending migrations
bin/rails db:seed                      # Seed with sample data
bin/rails db:reset                     # Drop + create + migrate + seed
bin/rails console                      # Interactive console
```

### Common Debug Commands
```bash
# Rails console queries
cd backend && bin/rails runner "puts Bundle.active.count"
cd backend && bin/rails runner "puts Order.last.order_number"

# Check routes
cd backend && bin/rails routes | grep -i orders

# Database state
cd backend && bin/rails runner "puts Bundle.pluck(:slug, :price, :discount_percent).inspect"
```

### Vercel Build Verification
Before pushing, verify the Next.js build succeeds locally:
```bash
npm run build
```
Common build failures:
- `useSearchParams()` not wrapped in `<Suspense>`
- Server-side code accessing `window` or Zustand `persist` API
- Missing `'use client'` directive on components using hooks

## Writing New Tests

### Backend Request Spec Template
```ruby
require "rails_helper"

RSpec.describe "Api::V1::NewEndpoint", type: :request do
  include AuthHelpers

  let(:user) { create(:user) }
  let(:token) { auth_token_for(user) }

  describe "GET /api/v1/resource" do
    it "returns resources" do
      create(:resource)
      get "/api/v1/resource", params: { locale: "hr" }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]).to be_an(Array)
    end
  end

  describe "POST /api/v1/resource" do
    it "creates resource" do
      post "/api/v1/resource",
        params: { name: "Test" },
        headers: { "Authorization" => "Bearer #{token}" }
      expect(response).to have_http_status(:created)
    end
  end
end
```

### Admin Spec Template
```ruby
RSpec.describe "Admin::Resource", type: :request do
  include AuthHelpers

  let(:admin) { create(:user, :admin) }
  let(:admin_token) { auth_token_for(admin) }
  let(:customer) { create(:user) }
  let(:customer_token) { auth_token_for(customer) }

  describe "GET /admin/resource" do
    it "returns 403 for non-admin" do
      get "/admin/resource", headers: { "Authorization" => "Bearer #{customer_token}" }
      expect(response).to have_http_status(:forbidden)
    end

    it "returns resources for admin" do
      get "/admin/resource", headers: { "Authorization" => "Bearer #{admin_token}" }
      expect(response).to have_http_status(:ok)
    end
  end
end
```
