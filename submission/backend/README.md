# Backend — Submission Package

## What to include

- [ ] Complete backend source code  
- [ ] `Dockerfile` (preferred)  
- [ ] Deployment instructions  
- [ ] Database schema and migration scripts  

## Development source location

Backend source lives at repository root: [`../../backend/`](../../backend/)

Before final submission, copy or reference:

```
backend/
├── src/
├── package.json
├── Dockerfile          # to be added
├── docker-compose.yml  # optional
└── README.md           # deployment steps
```

## Quick start (development)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Deployment

_[Docker build and deploy steps — to be completed]_

```bash
# docker build -t battery-fitness-api .
# docker run -p 3000:3000 battery-fitness-api
```
