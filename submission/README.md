# National Hackathon — Final Submission Package

**Project:** AI Powered Battery Fitness Assessment Application  
**Reference:** Concept Note and Participant Guide v3.0, July 2026 (NeGD / MYAS)

---

## Team Information

| Field | Value |
|-------|-------|
| Team Name | _[To be filled]_ |
| Team Members | _[Names, roles, emails]_ |
| Institution | _[To be filled]_ |
| App Version | _[e.g. v1.0]_ |
| Submission Date | _[To be filled]_ |

---

## Package Overview

This folder mirrors the **mandatory submission structure** (Section 12 of the Final Submission Requirements).  
Populate each subfolder before creating the final archive: `TeamName_Submission.zip`.

### Folder Map

| Folder | Purpose | Status |
|--------|---------|--------|
| [`app/`](app/) | Signed release APK, installation instructions, test credentials | Pending |
| [`source/`](source/) | Complete source code with Git history, BUILD.md, DEPENDENCIES.md | Pending |
| [`backend/`](backend/) | Backend source, Dockerfile, deployment instructions | Pending |
| [`models/`](models/) | AI model files (TFLite, ONNX, etc.) or download scripts | Pending |
| [`docs/`](docs/) | HLD, LLD, model cards, validation report, user guide, API spec, DB schema | Pending |
| [`demo/`](demo/) | Demo video (8–12 min, MP4 1080p) or external link file | Pending |
| [`presentation/`](presentation/) | Slide deck (12–20 slides, PDF or PPTX) | Pending |
| [`compliance/`](compliance/) | Data protection declaration, consent forms, data inventory | Pending |

---

## Development vs Submission

| Development (repo root) | Submission (this folder) |
|-------------------------|--------------------------|
| `app/` — React Native source | `source/` — export repo with `.git` history |
| `backend/` — API source | `backend/` — copy + Dockerfile |
| Build output | `app/` — release APK + install README |

---

## Quick Links

- [Final Submission Checklist](CHECKLIST.md)
- [Known Issues Log](docs/Known_Issues.md)
- [Build Instructions](source/BUILD.md)
- [Dependencies](source/DEPENDENCIES.md)

---

## Creating the Final Archive

```powershell
# From repository root, after all artifacts are populated:
Compress-Archive -Path submission\* -DestinationPath TeamName_Submission.zip
```

Ensure the archive root contains `README.md`, `app/`, `source/`, `docs/`, etc. directly (not nested inside an extra folder).
