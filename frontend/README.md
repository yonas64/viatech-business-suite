# Viatech Management frontend

The Next.js app provides an authenticated workspace for the Viatech NestJS API.

## Run locally

Start the backend API, then run the frontend:

```bash
npm run dev
```

By default, the frontend calls `http://localhost:3000`. Set
`NEXT_PUBLIC_API_BASE_URL` if the API runs elsewhere. Set
`NEXT_PUBLIC_CURRENCY_CODE` to an ISO 4217 currency code (for example `KES` or
`EUR`) to format financial values; it defaults to `USD`.

New registrations create staff accounts. Product, category, stock, and expense
management controls are available only to admin users. The API remains the
authority for authentication and authorization.

## Workspace pages

- `/` redirects to `/overview` — business overview, recent sales, and low-stock
  reminders
- `/products` and `/categories` — catalog browsing and admin creation
- `/inventory` — stock levels, low-stock status, and movement history
- `/sales` — sale entry and transaction history
- `/finance` — sales, collections, and profit summary
- `/expenses` — filtered expense register with admin create, edit, and delete
  controls
- `/reports` — daily, weekly, monthly, and date-range reports with optional
  category and product filters
- `/users` — admin-only workspace member and role management
- `/login` — sign-in and staff account registration
