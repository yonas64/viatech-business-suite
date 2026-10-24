<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deploy to Render

The repository root contains a `render.yaml` Blueprint for the API. It sets
`backend/` as the service root, installs from `package-lock.json`, builds the
NestJS app, and starts the compiled production entry point. To configure an
existing Render web service manually, set:

- **Root Directory:** `backend`
- **Build Command:** `npm ci --include=dev && npm run build`
- **Start Command:** `npm run start:prod`

Set `MONGO_URI` to a reachable MongoDB connection string in Render's environment
settings. The local backend also accepts the older `MONGODB_URI` name, but
`MONGO_URI` is preferred and required in production. Never commit either URI.
For MongoDB Atlas, use the `viatech` database path and give the database user
read/write access to that database. Configure Atlas Network Access to permit the
Render service's outbound connection.
Set `JWT_SECRET` to a long random value, or let the Blueprint generate one.
Render provides `PORT`; the API listens on that port automatically. The root
route (`/`) returns a small health response for Render's health check. Optionally
set `CORS_ORIGINS` to a comma-separated list of allowed frontend origins.

The MongoDB account in the connection string is separate from a Viatech
application login. A new live database does not automatically include users or
business data from your local MongoDB database. Existing records must be migrated
to the live database, or a new application account must be created there.

For a deployed Next.js frontend, set `NEXT_PUBLIC_API_BASE_URL` to the Render
service's public HTTPS URL (for example, `https://viatech-api.onrender.com`)
before building/deploying the frontend. The app embeds this public setting at
build time, so redeploy the frontend after changing it.

For a fresh database, create its first admin once from the backend directory
after setting `MONGO_URI` to the Render database connection string:

```bash
read -r -p "Admin name: " ADMIN_NAME
read -r -p "Admin username: " ADMIN_USERNAME
read -r -p "Admin email: " ADMIN_EMAIL
read -r -s -p "Admin password (12+ characters): " ADMIN_PASSWORD
printf '\n'
export ADMIN_NAME ADMIN_USERNAME ADMIN_EMAIL ADMIN_PASSWORD
npm run admin:create
unset ADMIN_NAME ADMIN_USERNAME ADMIN_EMAIL ADMIN_PASSWORD
```

Run this in the Render Shell, or in a trusted terminal connected to the live
database. The command refuses to operate on a database other than `viatech` and
refuses to create another admin if one already exists.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Check all API routes at once

Start the API and MongoDB first:

```bash
npm run start:dev
```

In another terminal, run the end-to-end route smoke test:

```bash
npm run test:api
```

The script registers and logs in a temporary admin, then exercises user creation,
listing, lookup, update, and deletion along with the auth, category, product,
inventory, sales, finance, and report routes in dependency order. It prints
each passing route and stops at the first failure with the HTTP status and response
body. Set `API_BASE_URL` to test another server, for example
`API_BASE_URL=http://localhost:3001 npm run test:api`.

Run this only against a development/test database: it creates a test admin, a sale,
and inventory movement records. It removes the temporary managed user and the
additional test variant. The temporary admin, soft-deleted test product, its
category, sale, original variant, and inventory movement records remain. Categories with products cannot be
deleted; this protects product references.

## Categories and products API

All `/categories` and `/products` endpoints require a bearer token. Creating,
updating, and deleting records, including product variants, requires an admin token.
Obtain one through `POST /auth/login` and send it as
`Authorization: Bearer <access_token>`.

### Categories

- `POST /categories` creates a category. Optional `specificationFields` configure
  variant attributes. Each field has a unique `key`, user-facing `label`, `type`
  (`text`, `number`, or `dimensions`), optional `unit`, and `required` (defaults to
  true). Keys use letters, numbers, and underscores and must start with a letter.
- `GET /categories` preserves the existing array response. Adding query parameters,
  such as `?search=mica&page=1&limit=20`, searches category names and returns
  `{ items, total, page, limit, totalPages }`.
- `GET /categories/:id`, `PATCH /categories/:id`, and `DELETE /categories/:id`
  retrieve, update, and delete a category. A category with products cannot be
  deleted, and changing its specification definitions is rejected if existing
  variants would become invalid.

Example category specification fields:

```json
[
  { "key": "thickness", "label": "Mica thickness", "type": "number", "unit": "mm" },
  { "key": "dimensions", "label": "Dimensions", "type": "dimensions", "unit": "mm" }
]
```

Dimensions require positive numeric `width` and `height`, with optional positive
`depth`. Number specifications must be non-negative. When a category defines fields,
unknown specification keys are rejected and required fields must be supplied for
each variant. Categories without definitions accept free-form text, numeric, or
dimension specifications.

### Products and variants

- `POST /products` creates a product with a `categoryId` and at least one variant.
- `GET /products` without query parameters preserves the existing array response.
  With query parameters it supports `search`, `categoryId`, `active`, `page`, `limit`,
  `sortBy` (`name`, `createdAt`, `sellingPrice`), `sortOrder` (`asc`, `desc`), and
  `specificationKey` plus `specificationValue`. The two specification filters must
  be supplied together. Search checks product name/description and variant SKU or
  legacy display specification. Filtered/paginated results use
  `{ items, total, page, limit, totalPages }`.
- `GET /products/:id`, `PATCH /products/:id`, and `DELETE /products/:id` retrieve,
  update product name/description/category, and soft-delete a product.
- `POST /products/:id/variants`, `PATCH /products/:id/variants/:variantId`, and
  `DELETE /products/:id/variants/:variantId` manage variants without replacing
  existing embedded variant IDs. A variant includes `sku`, `costPrice`,
  `sellingPrice`, `quantity`, `unit`, and optional `specifications`; legacy
  `specification` remains supported as a display string. Variant deletion is
  rejected when inventory or sales history refers to it, and every product must
  retain at least one variant.

Example variant:

```json
{
  "sku": "MICA-3MM",
  "specification": "3 mm mica",
  "specifications": { "thickness": 3, "dimensions": { "width": 600, "height": 300 } },
  "costPrice": 10,
  "sellingPrice": 18,
  "quantity": 25,
  "unit": "sheet"
}
```

SKUs are trimmed and normalized to uppercase. Duplicate SKUs within one product are
validated in the service; a MongoDB unique multikey index and a service precheck
protect uniqueness across products. Duplicate requests return HTTP 409. If the
database already contains duplicate SKUs, resolve them before applying/creating the
unique index.

## Inventory and stock tracking

All inventory routes require a bearer token. Stock receipts, issues, and corrections
are admin-only. The responsible user is taken from the authenticated token rather
than accepted from the request body.

- `GET /inventory/stock` returns current stock rows for every active product variant,
  including SKU, specifications, unit, minimum level, and `isLowStock`.
- `GET /inventory/stock?productId=<id>` returns all variants for a product. Add
  `&variantId=<variant-id>` to retrieve just one variant's stock row. The existing
  `productId` plus `variantId` lookup remains supported.
- `POST /inventory/stock/add` records received stock. Body:
  `{ "productId": "...", "variantId": "...", "quantity": 12,
  "reason": "Supplier delivery" }`.
- `POST /inventory/stock/remove` records an authorized issue/damage/write-off using
  the same body shape. It rejects stock reductions beyond available quantity.
- `POST /inventory/stock/adjust` records a physical stock count correction. Its
  `quantity` is the new counted on-hand amount, not a delta; include a reason.
- Sales create `sale` movement history and atomically deduct stock. An insufficient
  quantity returns HTTP 400, and concurrent issues/sales cannot reduce stock below
  zero.
- `GET /inventory/movements` returns paginated movement history with product and
  responsible-user details. Filter with `productId`, `variantId`, `movementType`
  (`in`, `out`, `sale`, `adjustment`), `from`, `to` (ISO dates), `page`, and `limit`.
- `GET /inventory/low-stock` lists variants at or below their configured
  `lowStockThreshold` (inclusive).

The API smoke script covers receipts, issues, physical-count adjustments, history
filters, sale deductions, and rejection of an over-issue. Run it only against a
development/test database because it creates test records.

## Sales

`POST /sales` creates a sale with one or more `{ productId, variantId, quantity }`
items. The API reads each variant's current `sellingPrice` and `vatRate`; a supplied
`unitPrice` is accepted only when it matches the stored selling price. VAT rates are
fractions between 0 and 1 (for example, `0.15` for 15%, or `0` for VAT-exempt
items). Each line and the sale totals are rounded to two decimal places. The sale
response stores item price/VAT snapshots, subtotal, VAT, final total, a generated
`saleReference`, `saleDate`, `paymentMethod`, and `paymentStatus`. Payment status
defaults to `paid`; callers may submit `pending` for an unpaid sale.
The request is cashier-authenticated, and stock is deducted with a matching sale
movement; insufficient stock rejects the sale.

## Expenses and reports dashboard

### Expenses

All expense reads require authentication; creating, editing, and deleting an expense
require an admin token. `POST /expenses` accepts:

```json
{
  "category": "transport",
  "amount": 25.5,
  "expenseDate": "2026-10-14T12:00:00.000Z",
  "description": "Delivery fuel",
  "reference": "REC-1042",
  "receiptUrl": "https://example.test/receipts/1042.jpg"
}
```

`category`, positive `amount`, `expenseDate`, and `description` are required. The
optional `reference` and absolute `receiptUrl` retain receipt/reference information.
The authenticated creator and record timestamps are stored by the API. Use
`GET /expenses?from=2026-10-01&to=2026-10-31&category=transport&page=1&limit=20`
to filter and paginate; the response includes the matching amount total. Expenses
can be retrieved, edited, and removed through `GET /expenses/:id`,
`PATCH /expenses/:id`, and `DELETE /expenses/:id`.

### Reports

The existing `GET /reports/daily`, `/reports/weekly`, and `/reports/monthly`
endpoints accept optional `date`, `productId`, and `categoryId` filters. A custom
range is available at
`GET /reports/summary?from=2026-10-01&to=2026-10-14&productId=<id>&categoryId=<id>`;
both range dates are required and date-only `to` values include that whole UTC day.
`GET /finance/summary` also accepts an optional `from` and `to` pair.

Reports return sale count, units sold, subtotal, VAT, final total, collected and
pending amounts, cost of goods sold, expenses, gross profit, estimated profit,
best-selling products, current stock, low-stock variants, recent sales, and recent
stock movements. Product/category filters narrow sale and stock metrics. General
operating expenses are date-filtered but are not attributed to a product/category;
they remain included in the expense total when those filters are used. Profit is an
estimate calculated as sales subtotal less item cost snapshots and operating
expenses. New sales snapshot variant cost and category; legacy records without those
snapshots use zero for unavailable cost and the product's current category when
possible.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

To add it to this project:

```bash
$ npm install @nestjs/observe
```

Then follow the [setup guide](https://docs.nestjs.com/observability/overview) - it takes a single import and an app key.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
{
    "email": "admin4@example.com",
    "password": "@Elkeraza22223145",
}