# Mobile App Source

React Native application — onboarding, role selection, athlete/coach auth flows.

## Run locally

```bash
cd source
npm install
npm start
npm run android
```

Or from repository root:

```bash
npm run source:start
npm run source:android
```

## Structure

```
source/
├── App.tsx
├── android/
├── ios/
├── src/              # screens, navigation, db, services
├── assets/
├── BUILD.md          # Build release APK
└── DEPENDENCIES.md   # Third-party libraries
```

Built release APK goes in [`../app/`](../app/) for submission.
