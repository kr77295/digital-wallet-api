# Digital Wallet API

A mini digital wallet system built with Node.js, Express, and MySQL.
Built for the CodeGama Node.js Developer hiring assignment.

## Architecture

MVC + service layer:

```
src/
  config/        DB connection (Sequelize instance + sequelize-cli config)
  constants/     static data (currency rates)
  database/
    migrations/  Sequelize migrations - this IS your schema, edit here not in DBeaver
    seeders/      (optional) seed data scripts
  models/        Sequelize models (User, Wallet, Transaction) + associations -> "M"
  controllers/   thin HTTP layer, calls services, shapes responses          -> "C"
  services/      all business logic (auth, wallet, transactions, currency, fraud)
  middlewares/   auth (JWT), validation, rate limiting, error handling
  validations/   express-validator rule sets
  routes/        route -> middleware -> controller wiring                   -> "V" (JSON, no view engine)
  utils/         ApiError, ApiResponse, catchAsync, JWT helpers
```

Controllers stay thin on purpose - they don't talk to models directly.
All business rules (balance checks, fraud checks, currency conversion)
live in the service layer so they're testable and reusable independently
of Express.

## Tech stack

- Node.js / Express
- MySQL + Sequelize (ORM + migrations via sequelize-cli)
- JWT (jsonwebtoken) for stateless auth
- bcryptjs for password hashing
- express-validator for input validation
- express-rate-limit for API throttling
- helmet, cors for basic hardening

## Setup

### 1. Create the database (in DBeaver, or CLI)

Open DBeaver, connect to your local MySQL server, and either:
- Right-click your MySQL connection -> Create New Database -> name it `digital_wallet`, or
- Open a SQL editor against your MySQL connection and run:
  ```sql
  CREATE DATABASE digital_wallet CHARACTER SET utf8mb4;
  ```

### 2. Configure and install

```bash
git clone <your-repo-url>
cd digital-wallet-api
npm install
cp .env.example .env
# edit .env - set DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME to match
# the MySQL connection you set up in DBeaver, and set JWT_SECRET
```

### 3. Run the migrations

This is the part that replaces "CREATE TABLE" — Sequelize reads the
migration files in `src/database/migrations/` and builds the schema for you.

```bash
npm run migrate
```

You should see `users`, `wallets`, `transactions`, and a `SequelizeMeta`
tracking table appear. Refresh the DBeaver connection tree and you'll see
them all there — that's your normal workflow going forward: **the schema
lives in migration files, DBeaver is just for browsing/querying data**,
not for hand-editing table structure.

Useful commands:
```bash
npm run migrate:status     # see which migrations have run
npm run migrate:undo       # roll back the last migration
npm run migrate:undo:all   # drop everything the migrations created
```

### 4. Run the API

```bash
npm run dev      # nodemon, or `npm start` for plain node
```

## Schema (created by the migrations)

**users** — id, name, email (unique), password (hashed), default_currency, is_frozen, timestamps

**wallets** — id, user_id (FK -> users, unique = one wallet per user), balance (DECIMAL 18,2), currency, timestamps

**transactions** — id, wallet_id (FK -> wallets), user_id (FK -> users), type (ENUM: credit/debit/transfer_in/transfer_out/withdrawal), amount, currency, amount_in_usd, balance_after, counterparty_id (FK -> users, nullable), status (ENUM: success/failed/blocked), description, timestamps. Indexed on (user_id, created_at) since history is always queried per-user, newest first.

## API Reference

Base URL: `http://localhost:5000/api/v1`

All authenticated routes require:
`Authorization: Bearer <token>`

### Auth

| Method | Endpoint        | Description                          | Auth |
|--------|-----------------|---------------------------------------|------|
| POST   | `/auth/register` | Register user + auto-create wallet   | No   |
| POST   | `/auth/login`     | Login, returns JWT                   | No   |
| GET    | `/auth/me`        | Get authenticated user's profile     | Yes  |

**Register**
```json
POST /auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "defaultCurrency": "USD"
}
```

**Login**
```json
POST /auth/login
{ "email": "jane@example.com", "password": "secret123" }
```

### Wallet

| Method | Endpoint             | Description                              |
|--------|----------------------|-------------------------------------------|
| GET    | `/wallet/balance`     | Get balance. `?currency=EUR` to convert   |
| POST   | `/wallet/add-funds`   | Add funds to own wallet                   |
| POST   | `/wallet/withdraw`    | Withdraw funds from own wallet             |
| POST   | `/wallet/transfer`    | Transfer funds to another user's wallet    |

```json
POST /wallet/add-funds
{ "amount": 500, "currency": "USD" }

POST /wallet/withdraw
{ "amount": 100, "currency": "USD" }

POST /wallet/transfer
{ "amount": 50, "currency": "USD", "recipientEmail": "friend@example.com" }
```

`currency` is optional on all three - defaults to the wallet's own
currency if omitted. Supported currencies: `USD, INR, EUR, GBP, JPY`
(see `src/constants/currencies.js` - swap in a live FX API there if needed).

### Transactions

| Method | Endpoint         | Description                                   |
|--------|------------------|------------------------------------------------|
| GET    | `/transactions`  | Paginated history. `?page=1&limit=20&type=credit` |

## Feature notes

**Multi-currency** - every wallet has one home currency. Deposits,
withdrawals and transfers can be made in any supported currency and
are converted at the current rate before being applied. Conversion
logic lives in `currency.service.js`.

**Fraud detection & limits** (`fraud.service.js`), checked before any
debit/withdrawal/transfer goes through:
- Daily limit: default $10,000 USD-equivalent per rolling 24h, configurable via `DAILY_TXN_LIMIT_USD`.
- Suspicious burst detection: N (`SUSPICIOUS_TXN_COUNT`, default 3) transactions above a threshold (`SUSPICIOUS_AMOUNT_THRESHOLD_USD`, default $1000) within a short window (`SUSPICIOUS_WINDOW_MINUTES`, default 10 min) freezes the account and blocks the transaction.

**Rate limiting** (`rateLimiter.middleware.js`) - three tiers:
- general: 100 req / 15 min per user (or IP if unauthenticated)
- transaction endpoints: 20 req / 15 min
- auth endpoints (register/login): 10 req / 15 min, to slow brute force

All limits are configurable through `.env`.

**Concurrency safety** - transfers and withdrawals run inside a MySQL
transaction with row-level locks (`SELECT ... FOR UPDATE` under the hood,
via Sequelize's `lock: t.LOCK.UPDATE`) so two simultaneous requests against
the same wallet can't produce an inconsistent balance. Transfers lock both
wallets in a fixed order (by user id) to avoid deadlocks.

## Testing it manually

A Postman collection is included at `postman_collection.json` - import
it, set the `baseUrl` variable, register a user, then copy the returned
token into the collection's `token` variable to hit the protected routes.

## What I'd add with more time

- Automated tests (Jest + supertest) for services and routes
- Refresh tokens / token blacklist on logout
- Idempotency keys on transfer/withdraw to guard against duplicate submits
- Swagger/OpenAPI docs generated from the route definitions
- Real FX rate provider with caching instead of the static rate table
