# Playwright MCP — Browser Testing Guide

The Playwright MCP server provides browser automation tools for visually testing the app.

## Prerequisites

Both services must be running:
```bash
# Terminal 1: Backend on port 3001
cd backend && bin/rails server -p 3001

# Terminal 2: Frontend on port 3000
npm run dev
```

## Core Workflow

### 1. Navigate to a page
```
mcp__playwright__browser_navigate({ url: "http://localhost:3000/hr/shop/" })
```

### 2. Take a snapshot (preferred over screenshot for interaction)
```
mcp__playwright__browser_snapshot()
```
Returns an accessibility tree with `ref` attributes for each interactive element. Use these refs for clicks, fills, etc.

### 3. Take a screenshot (for visual verification)
```
mcp__playwright__browser_take_screenshot()
```

### 4. Interact with elements
```
mcp__playwright__browser_click({ element: "Submit button", ref: "e12" })
mcp__playwright__browser_fill_form({ ref: "e5", value: "user@example.com" })
mcp__playwright__browser_select_option({ ref: "e8", value: "hr" })
mcp__playwright__browser_press_key({ key: "Enter" })
```

### 5. Wait for navigation/loading
```
mcp__playwright__browser_wait_for({ state: "networkidle" })
```

### 6. Check console for errors
```
mcp__playwright__browser_console_messages()
```

### 7. Check network requests
```
mcp__playwright__browser_network_requests()
```

## Common Test Scenarios

### Test Shop Page
```
1. browser_navigate({ url: "http://localhost:3000/hr/shop/" })
2. browser_snapshot()  — verify bundle cards are rendered
3. browser_take_screenshot() — visual check
```

### Test Add to Cart
```
1. browser_navigate({ url: "http://localhost:3000/hr/shop/" })
2. browser_snapshot() — find "Dodaj u košaricu" button ref
3. browser_click({ ref: "<button_ref>" })
4. browser_snapshot() — verify cart badge updated
5. browser_navigate({ url: "http://localhost:3000/hr/cart/" })
6. browser_snapshot() — verify item in cart
```

### Test Checkout Flow
```
1. Navigate to cart with items
2. Click checkout button
3. browser_snapshot() — get form field refs
4. Fill form fields:
   - browser_fill_form({ ref: "email_ref", value: "test@example.com" })
   - browser_fill_form({ ref: "name_ref", value: "Test User" })
   - browser_fill_form({ ref: "street_ref", value: "Test St 1" })
   - etc.
5. Select shipping method
6. Submit order
7. Verify order confirmation page
```

### Test Promo Code
```
1. Navigate to cart with items
2. browser_snapshot() — find promo input ref
3. browser_fill_form({ ref: "promo_ref", value: "LUNA10" })
4. browser_click({ ref: "apply_button_ref" })
5. browser_snapshot() — verify discount appears in summary
```

### Test Admin Panel
```
1. browser_navigate({ url: "http://localhost:3000/hr/signin/" })
2. Fill login form with admin credentials
3. browser_navigate({ url: "http://localhost:3000/hr/admin/" })
4. browser_snapshot() — verify dashboard stats
5. browser_navigate({ url: "http://localhost:3000/hr/admin/orders/" })
6. browser_snapshot() — verify order table
```

### Test Language Switching
```
1. browser_navigate({ url: "http://localhost:3000/hr/shop/" })
2. browser_snapshot() — find EN button ref
3. browser_click({ ref: "en_button_ref" })
4. browser_wait_for({ state: "networkidle" })
5. browser_snapshot() — verify page is now in English, URL is /en/shop/
```

### Test Mobile Layout
```
1. browser_resize({ width: 375, height: 812 })
2. browser_navigate({ url: "http://localhost:3000/hr/" })
3. browser_snapshot() — find hamburger menu ref
4. browser_click({ ref: "hamburger_ref" })
5. browser_snapshot() — verify mobile menu opened
6. browser_take_screenshot() — visual check
```

### Test Discount Display
```
1. Ensure at least one bundle has discount_percent > 0 (check via backend)
2. browser_navigate({ url: "http://localhost:3000/hr/shop/" })
3. browser_snapshot() — verify discount badge (-X%) on discounted bundle
4. Click on discounted bundle
5. browser_snapshot() — verify original price strikethrough + sale price on detail page
6. Add to cart
7. Navigate to cart
8. browser_snapshot() — verify:
   - Cart item shows original price crossed out + sale price
   - Summary shows "Originalna cijena" at top
   - Bundle savings row shown
   - Total reflects discounted price
```

## Tips

- **Always snapshot before interacting** — you need the ref values from the accessibility tree
- **Use `networkidle`** after navigation to ensure API calls complete
- **Check console messages** if something looks wrong — catches JS errors
- **Check network requests** to debug API failures
- **Resize for mobile** — use `browser_resize({ width: 375, height: 812 })` for iPhone-size
- **Locale in URLs** — always include `/hr/` or `/en/` prefix
- **Trailing slashes** — all routes end with `/` (Next.js config)
- **Admin login** — use email/password from backend seeds (default: admin@lunababy.eu / admin123!)

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_navigate_back` | Go back |
| `browser_snapshot` | Get accessibility tree with refs |
| `browser_take_screenshot` | Capture visual screenshot |
| `browser_click` | Click element by ref |
| `browser_fill_form` | Type into input by ref |
| `browser_select_option` | Select dropdown option |
| `browser_press_key` | Press keyboard key |
| `browser_hover` | Hover over element |
| `browser_drag` | Drag element |
| `browser_type` | Type text (without clearing) |
| `browser_wait_for` | Wait for state (networkidle, load, etc.) |
| `browser_resize` | Set viewport size |
| `browser_console_messages` | Get console log/error messages |
| `browser_network_requests` | Get network request log |
| `browser_tabs` | List open tabs |
| `browser_handle_dialog` | Accept/dismiss dialogs |
| `browser_file_upload` | Upload files |
| `browser_evaluate` | Run arbitrary JS in page |
| `browser_run_code` | Run Playwright code directly |
| `browser_close` | Close browser |
| `browser_install` | Install browser binaries |
