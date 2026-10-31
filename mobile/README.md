# Viatech mobile app

The Expo React Native app connects to the existing NestJS API and includes
authentication, dashboard, products and variants, categories, inventory,
sales, finance, expenses, reports, and admin team management.
Use the header menu to switch sections, or the back arrow and Android system
back button to return to the previous section. The app respects Android and
iOS safe areas so content stays clear of system bars. Sale history displays
the product SKU captured when the sale was created. The overview defaults to
today and can be changed to a week, month, year, or selected day. Overview
cards link to their corresponding sections. The bottom navigation provides
Home, Sales, Products, and Profile; it hides while scrolling down and returns
when scrolling up. Prices use ETB by default.

## Start the app

```bash
npm install
npx expo start
```

To test the app in a desktop browser, start the web target. Set
`EXPO_PUBLIC_API_BASE_URL` in `mobile/.env` to the API URL you want to use; the
checked-in example points to the Render API:

```bash
npx expo start --web
```

The web version keeps the session token in memory only. Reloading the page signs
you out; Android and iOS continue to use Expo SecureStore.

Expo loads `EXPO_PUBLIC_API_BASE_URL` from `mobile/.env`. The app defaults to
`http://localhost:3000` if it is not set, which is suitable for a simulator or
device running on the same host network configuration:

- Physical iOS/Android device: use the computer's LAN IP, for example
  `http://192.168.1.20:3000`.
- Android emulator: use `http://10.0.2.2:3000`.
- iOS simulator: `http://localhost:3000` usually reaches the host computer.

To use a local backend instead, update `mobile/.env` with its reachable address:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000
```

Ensure the backend is listening on an interface reachable by the device and
that the phone and development computer can communicate over the network.
Never use a production API address with unencrypted HTTP.

## Build an Android APK

The EAS `preview` profile builds an installable APK configured to use the
Render API:

```bash
npx eas-cli build --platform android --profile preview
```

Sign in to an Expo account when prompted. When the cloud build finishes, EAS
provides a download link for the APK.

## Expo Go reports an incompatible project

This project is configured for Expo SDK 58. Install an Expo Go version that
supports SDK 58. If Expo Go
still reports an incompatibility, stop the current server and restart with a
cleared cache:

```bash
npx expo start --clear
```

Then scan the QR code from that newly started server. The API URL in `.env`
does not affect Expo Go's SDK compatibility. The Expo Go app and the project's
Expo SDK must support the same SDK version.
