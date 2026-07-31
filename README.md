# AI-Powered Battery Fitness Assessment

National Hackathon submission project — NeGD / MYAS, July 2026.

## Repository Structure

```
├── app/            # Release APK, installation instructions, test credentials
├── source/         # React Native mobile app source + BUILD.md, DEPENDENCIES.md
├── backend/        # Node.js API server (auth, sync)
├── models/         # AI model files (TFLite, ONNX, etc.)
├── docs/           # HLD, LLD, model cards, validation report, user guide, API spec
├── demo/           # Demo video (8–12 min)
├── presentation/   # Slide deck
├── compliance/     # Data protection declaration, consent forms
├── CHECKLIST.md    # Final submission checklist
└── README.md
```

## Team Information

| Field | Value |
|-------|-------|
| Team Name | _[To be filled]_ |
| Team Members | _[Names, roles, emails]_ |
| App Version | _[e.g. v1.0]_ |

## Quick Start (Development)

```sh
npm run install:all

# Mobile app (from source/)
npm run source:start
npm run source:android

# Backend
npm run backend:start
```

## App Flow

1. **Onboarding** — splash / intro slides  
2. **Role Select** — choose Athlete or Coach  
3. **Login / Register** — OTP verification and password setup  
4. **Home** — role-specific dashboard  

## Submission

- [Final Submission Checklist](CHECKLIST.md)
- [Build Instructions](source/BUILD.md)
- [Known Issues](docs/Known_Issues.md)

Before deadline, populate all folders and create: `TeamName_Submission.zip`

```powershell
# Archive root folders (exclude node_modules, .git)
Compress-Archive -Path app,source,backend,models,docs,demo,presentation,compliance,README.md,CHECKLIST.md -DestinationPath TeamName_Submission.zip
```

See `auth-flow-documentation.md` for authentication flow details.
