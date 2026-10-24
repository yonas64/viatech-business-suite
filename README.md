# Viatech workspace

This workspace keeps the NestJS + MongoDB API and the Next.js frontend in
separate folders:

- `backend/` - NestJS REST API
- `frontend/` - Next.js App Router with TypeScript and Tailwind CSS
- `landingpage/` - Vite marketing landing page
- `mobile/` - Expo React Native app for iOS and Android

## Run the backend

```bash
cd backend
npm install
npm run start:dev
```

The backend reads its configuration from `backend/.env`. Keep this local file
private; use `backend/.env.example` as the template for another environment.
For Render deployment settings, see [backend/README.md](./backend/README.md#deploy-to-render)
or use the repository's `render.yaml` Blueprint. Configure the deployed
frontend's `NEXT_PUBLIC_API_BASE_URL` to the Render API URL before its build.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev -- --port 3001
```

Open <http://localhost:3001>. The API defaults to port 3000; set
`NEXT_PUBLIC_API_BASE_URL` in
`frontend/.env.local` to the backend URL if it runs on a different port or host.

## Frontend structure

```text
frontend/src/
  app/          Next.js routes and layouts
  components/   Shared UI components
  features/     Feature-specific screens and components
  hooks/        Shared React hooks
  lib/api/      Backend connection setup
  types/        Shared frontend types
```

## Run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_BASE_URL` to the backend URL reachable from the device before
starting Expo. For a physical device, use the computer's LAN IP address (not
`localhost`); Android emulators can usually reach a host machine at
`http://10.0.2.2:3000`. See [mobile/README.md](./mobile/README.md) for details.