# AI-Powered Battery Fitness Assessment

Monorepo for the Battery Fitness Assessment platform.

## Project Structure

```
├── app/       # React Native mobile app (onboarding, auth, athlete/coach flows)
├── backend/   # Node.js API server (auth, sync)
└── README.md
```

## Prerequisites

- Node.js >= 22.11.0
- React Native environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment))

## Install Dependencies

From the repository root:

```sh
npm run install:all
```

Or install each package separately:

```sh
cd app && npm install
cd ../backend && npm install
```

## Mobile App (`app/`)

```sh
# Start Metro bundler
npm run app:start

# Run on Android
npm run app:android

# Run on iOS (macOS only, after pod install in app/ios)
npm run app:ios
```

All React Native commands can also be run directly from the `app/` folder:

```sh
cd app
npm start
npm run android
```

## Backend (`backend/`)

```sh
# Copy env template and configure
cp backend/.env.example backend/.env

# Start API server
npm run backend:start

# Dev mode with auto-reload
npm run backend:dev
```

## App Flow

1. **Onboarding** — splash / intro slides
2. **Role Select** — choose Athlete or Coach
3. **Login / Register** — OTP verification and password setup
4. **Home** — role-specific dashboard

See `auth-flow-documentation.md` for full authentication flow details.
