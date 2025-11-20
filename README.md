## Coupon Management Service

A lightweight Coupon Management backend for e-commerce teams. It exposes APIs to create coupons, inspect stored coupons, and pick the best eligible coupon for a shopper using clear eligibility checks and an in-memory store.

### Tech Stack
- Node.js 20+, Express 4
- TypeScript (strict mode)
- In-memory persistence with simple maps/arrays (no external DB)

### Project Structure
```
src/
 ├── app.ts                # Express app + middleware
 ├── server.ts             # Entry-point (compiled to dist/server.js)
 ├── controllers/          # HTTP handlers
 ├── routes/               # Express routers
 ├── services/             # Business logic + helpers
 ├── models/               # Shared TypeScript types
 ├── utils/                # Reusable utilities & stores
 └── data/seed.ts          # Demo login seeding
server.js                  # Wrapper for running compiled build
package.json               # Scripts + deps
tsconfig.json              # Strict TS compiler settings
```

### Setup
1. Install dependencies  
   `npm install`
2. Build TypeScript → JavaScript (outputs to `dist/`)  
   `npm run build`

### Run
- Development (watch mode): `npm run dev`
- Production build: `npm run build && npm start`
- Or run the compiled bundle directly: `node dist/server.js`  
  (A helper `server.js` is provided for deployments expecting that filename.)

### Demo Login Seed
`hire-me@anshumat.org / HireMe@2025!` is inserted into the in-memory user list on boot (no authentication flow is implemented; it is provided for demo/reference data).

### Coupon Rules & Best Coupon Algorithm
1. **Date window check** – coupon must be within `startDate`/`endDate`.
2. **Usage limit** – optional per-user cap backed by an in-memory counter. Pass `"commitUsage": true` in `/best-coupon` requests to increment usage when a coupon is selected.
3. **Eligibility helpers** – modular functions validate each rule:
   - `allowedUserTiers`, `minLifetimeSpend`, `minOrdersPlaced`, `firstOrderOnly`
   - `allowedCountries`, `minCartValue`, `applicableCategories`, `excludedCategories`, `minItemsCount`
4. **Discount calculation** – FLAT applies fixed value; PERCENT applies rate × cart value capped by `maxDiscountAmount`. Discounts never exceed cart total.
5. **Best coupon selection** – choose the highest discount, tie-break by earliest `endDate`, then lexicographically smaller `code`.
6. **Duplicate code protection** – `POST /coupons` rejects codes already stored (documented behavior).

All data lives in memory for simplicity; restarting the process resets coupons and counters.

### API Reference

#### POST `/coupons`
Create a coupon (rejects duplicate `code`).

Request body:
```json
{
  "code": "FESTIVE25",
  "description": "25% off for Gold tier",
  "discountType": "PERCENT",
  "discountValue": 25,
  "maxDiscountAmount": 500,
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "usageLimitPerUser": 2,
  "eligibility": {
    "allowedUserTiers": ["GOLD"],
    "minCartValue": 1000,
    "applicableCategories": ["electronics"]
  }
}
```

#### GET `/coupons`
Returns every coupon currently stored for debugging/QA.

#### POST `/best-coupon`
Evaluate the cart + user context and optionally reserve the best coupon.

Request body:
```json
{
  "userContext": {
    "id": "user-123",
    "email": "hire-me@anshumat.org",
    "tier": "NEW",
    "lifetimeSpend": 1500,
    "ordersPlaced": 3,
    "country": "IN"
  },
  "cart": {
    "items": [
      { "productId": "sku-1", "category": "fashion", "unitPrice": 500, "quantity": 1 },
      { "productId": "sku-2", "category": "fashion", "unitPrice": 750, "quantity": 2 }
    ]
  },
  "commitUsage": true
}
```

Successful response:
```json
{
  "coupon": {
    "...": "full coupon payload"
  },
  "discountAmount": 375
}
```

If no coupon qualifies, the API returns `null`.

### Usage Limit Simulation Tip
- Omitting `commitUsage` simply evaluates eligibility.
- Setting `"commitUsage": true` increments the per-user counter for the winning coupon, letting you simulate redemptions across multiple calls until the `usageLimitPerUser` is reached.

### Testing Ideas
- Seed multiple coupons and run `/best-coupon` with various `cart` and `userContext` mixes to see eligibility fall-throughs.
- Restart the server to clear all memory, mimicking a clean environment.

### AI Assistance Used
- Prompt: “You are the senior engineer helping me build a complete assignment project... [full assignment brief pasted]”

Feel free to adapt this scaffold with persistent storage, auth, or richer validation for production use.

