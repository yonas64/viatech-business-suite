# Viatech mobile app

The Expo React Native app connects to the existing NestJS API and includes
authentication, dashboard, products and variants, categories, inventory,
sales, finance, expenses, reports, and admin team management.

## Start the app

```bash
npm install
npx expo start
```

To test the app in a desktop browser, make sure the backend is running on the
same PC and start the web target:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 npx expo start --web
```

The web version keeps the session token in memory only. Reloading the page signs
you out; Android and iOS continue to use Expo SecureStore.

Set `EXPO_PUBLIC_API_BASE_URL` to the backend URL reachable from the device.
The app defaults to `http://localhost:3000`, which is suitable for a simulator
or device running on the same host network configuration:

- Physical iOS/Android device: use the computer's LAN IP, for example
  `http://192.168.1.20:3000`.
- Android emulator: use `http://10.0.2.2:3000`.
- iOS simulator: `http://localhost:3000` usually reaches the host computer.

For example, create a local `.env` file in `mobile/`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000
```

Ensure the backend is listening on an interface reachable by the device and
that the phone and development computer can communicate over the network.
Never use a production API address with unencrypted HTTP.

## Expo Go reports an incompatible project

This project is configured for Expo SDK 57 to match Expo Go 57.0.9. If Expo Go
still reports an incompatibility, stop the current server and restart with a
cleared cache:

```bash
npx expo start --clear
```

Then scan the QR code from that newly started server. The API URL in `.env`
does not affect Expo Go's SDK compatibility. The Expo Go app and the project's
Expo SDK must support the same SDK version.
