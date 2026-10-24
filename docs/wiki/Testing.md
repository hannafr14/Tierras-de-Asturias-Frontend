# Frontend Testing

## Unit Tests

Run from the repository root:

```bash
npm ci
npm run test:unit -- --run
```

Vitest uses jsdom and excludes `e2e`. Tests cover views, components, stores, and services: authentication, cart, checkout, confirmation, own orders, catalog, details, and map. Tests that mock services do not verify real MySQL persistence.

```bash
npm run test:unit -- --run src/__tests__/views/ProductsPage.spec.js src/__tests__/views/FarmDetailsView.spec.js
npm run test:coverage
```

Coverage is generated in `coverage/`. Do not claim a percentage without the date and scope of a verifiable run.

## Playwright

```bash
npx playwright install chromium
npm run test:e2e -- e2e/farm-navigation.spec.js --project=chromium
```

The configuration starts or reuses Vite on `5173`. In CI, it uses preview on `4173` and requires a prior build. The navigation test mocks catalog responses and does not create real orders.

Chromium, Firefox, and WebKit projects are configured. Running all of them requires installing their browsers.

### Outstanding Starter Test

`e2e/vue.spec.js` expects `You did it!`, a heading that no longer matches the application. Update it before treating the complete suite as validated. This documentation does not modify or disable tests.

## Build

```bash
npm run build
```

A successful build does not prove that the backend, database, and external resources are available.

## Manual Checks

- Catalogs, categories, empty search results, details, and images.
- Map and navigation on desktop and mobile.
- Valid and invalid registration, duplicate email, and failed login.
- Remember-me login, logout, and private-route access.
- Empty cart, quantities, removal, and invalid delivery data.
- Guest and authenticated orders, history, pagination, and own order details.
- A different user must not access another customer's order.

Use a development database and fictitious data. A manual checkout creates real database records, unlike a unit test with a mocked API.
