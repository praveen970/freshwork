# Freshwork

React storefront and a separate Express API with SQLite accounts and orders. Requires Node 22.13+ (Node 24+ recommended).

## Development

```sh
npm install
npm run dev
```

Open http://localhost:5173. API runs on port 3001.

## Build and verify

```sh
npm run build
npm test
npm start
```

The built frontend and API are served at http://localhost:3001.

## Folders

- `frontend/src/main.jsx`: application routes.
- `frontend/src/pages/`: catalog, product, login, account, and checkout pages.
- `frontend/src/components/`: shared header, footer, and shopping bag.
- `frontend/src/store.jsx`: cart, session state, and API helpers.
- `frontend/src/styles.css`: responsive styles, typography, and interaction states.
- `backend/src/server.js`: REST APIs and authentication.
- `backend/src/catalog.js`: 36 demo products, with prices in integer cents.
- `backend/src/server.test.js`: isolated API integration tests.
- `backend/data/store.sqlite`: generated persistent storage; gitignored.

## Demo account

Email: `demo@freshwork.store`  
Password: `Freshwork123!`

Guests can check out directly. Signed-in customers can view their orders. Guest orders are not automatically attached to accounts. The cart persists locally; search, filters and sort persist in the URL.

## API

- GET `/api/products` — query: q, category, collection, min, max, sort
- GET `/api/products/:id`
- POST `/api/auth/register` — name, email, password
- POST `/api/auth/login` — email, password
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/orders` — items (id, quantity), shipping (name, email, address, city, postal), payment (success or decline)
- GET `/api/orders` — authenticated order history

Sort: featured, price-asc, price-desc, rating, newest. Collection: deal, new, clearance.

## Design and demo boundaries

Warm neutrals, forest green, Manrope headings and DM Sans text. Responsive sidebar filters, product cards, product details, bag drawer, guest/member checkout, and loading/error/empty states. Fonts and illustrative Unsplash photography require internet access.

Payments are simulated: no card details, money transfer or shipping. Shipping costs $8 below $100, otherwise free. Tax is omitted. Stock and reviews are seeded; stock does not decrease after demo orders.

Passwords use scrypt; sessions use random HTTP-only SameSite cookies. Checkout is validated and totals are calculated by the server. A real launch still needs payments, tax/shipping integration, transactional inventory, password recovery, production rate limiting, monitoring, accessibility audit, and exact product assets. Set NODE_ENV=production behind HTTPS for secure cookies.
