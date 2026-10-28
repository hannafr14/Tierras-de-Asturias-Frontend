# Tierras de Asturias | Frontend

A web application for discovering producers in Asturias, browsing their products, and placing orders as a guest or a registered customer.

Academic project under development. Order creation is implemented; Stripe payments are not integrated.

## Repositories and Documentation

- [Frontend](https://github.com/hannafr14/Tierras-de-Asturias-Frontend)
- [Backend](https://github.com/hannafr14/Tierras-de-Asturias-backend)
- [Project presentation (Spanish)](https://docs.google.com/presentation/d/1Yn5bRhzrTvO0jzYGpZPvcEDlCiJybbf84Nfpn8CbZb4/edit?slide=id.h45e99d6f897da351_0_31#slide=id.h45e99d6f897da351_0_31)
- [Frontend Wiki](docs/wiki/Home.md)
- [Screenshots and Project Links](docs/wiki/Media-and-Links.md)

## Design and Planning

- [Desktop mockup](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=0-1)
- [Mobile design](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=38-1251)
- [Wireframe](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=38-1252)
- [Jira backlog, PPTDA](https://hannafrolova14.atlassian.net/jira/software/projects/PPTDA/boards/67/backlog?selectedIssue=PPTDA-392)

These are the project links supplied by the author. Access may require permission. Designs describe the intended interface, not proof that every feature is implemented.

A public deployment URL is still pending. Wiki pages are local Markdown files and are not automatically published to GitHub Wiki or Confluence.

## Features

- Product and farm catalogs, search, and category selection.
- Leaflet map with markers linking to producer pages.
- Product and farm detail pages, including each producer's products.
- Shopping cart with quantity controls and local persistence.
- Registration, login, remember-me login, and logout.
- Delivery form and order creation for guests and authenticated customers.
- Order confirmation and a private area with paginated history and order details.
- Desktop and mobile layouts, including loading, error, and empty states.

## Stack and Requirements

Versions declared in [package.json](package.json): Vue 3.5, Vite 8.1, Vue Router 5.2, Pinia 4, Leaflet 1.9, and SCSS. Tests use Vitest, Vue Test Utils, jsdom, and Playwright.

You need Node.js matching `^22.18.0 || >=24.12.0`, npm, Git, and the backend running at `http://localhost:8080` to use real data. Maps and external images require Internet access.

## Local Setup

Run from this repository's root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. Vite may choose another port if that port is occupied.

Requests use relative `/api` URLs. During development, [vite.config.js](vite.config.js) proxies them to the backend on port `8080`. This local configuration does not require a `.env` file.

Keep the hostname consistent when testing: `localhost` and `127.0.0.1` do not share cookies or browser storage.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Build into `dist/` |
| `npm run preview` | Preview the local build; not a production server |
| `npm run test:unit -- --run` | Run unit tests once |
| `npm run test:coverage` | Generate coverage in `coverage/` |
| `npm run test:e2e -- e2e/farm-navigation.spec.js --project=chromium` | Farm navigation using a mocked API |

Before using Playwright, run `npx playwright install chromium`.

The full E2E suite still includes a starter test in `e2e/vue.spec.js` that expects `You did it!`. Update it before treating a full-suite run as valid. See [Testing](docs/wiki/Testing.md).

## Routes

| Route | Content |
|---|---|
| `/` | Redirect to `/granjas` |
| `/granjas`, `/granjas/:id` | Farm catalog and details |
| `/productos`, `/productos/:id` | Product catalog and details |
| `/cart`, `/checkout`, `/checkout/success` | Cart, delivery, and confirmation |
| `/register`, `/login` | Registration and sign-in |
| `/mi-cuenta` | Profile and history; session required |
| `/mi-cuenta/pedidos/:id` | Own order details; session required |

## Structure

```text
src/
  components/   Shared components grouped by feature
  views/        Pages
  router/       Routes and navigation guards
  stores/       Cart and authentication with Pinia
  services/     API access and CSRF
  scss/         Shared styles
  __tests__/    Unit tests
public/images/farms/  Images and source records
e2e/                 Playwright tests
docs/wiki/           Documentation
```

## Status and Limitations

- Product search and category filtering run in the browser. Categories come from the API, not from product-name guesses.
- The `Filtros` button does not yet open additional price or producer filters.
- Payment processing, password recovery, profile editing, and order-status administration are not implemented.
- Shipping and tax calculations are demonstrative, not validated commercial or tax policies.
- Before commercial use, the backend needs stronger amount calculations and inventory controls.
- Photographs vary in resolution and rights. Recording a source does not grant permission to republish it.

Final screenshots are pending; see [Required Screenshots and Links](docs/wiki/Media-and-Links.md). Do not publish passwords, cookies, keys, or real customer data.

No general license is declared for the code or images. Confirm permissions before redistributing the project.
