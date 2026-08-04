# Athlete Dashboard API shape

The mobile app expects:

```
GET /api/athlete/dashboard
Authorization: Bearer <token>   # optional for now; wire when auth tokens exist
```

## Success response

```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "Aarav Sharma",
      "athleteId": "NSRS-184729",
      "age": 15,
      "gender": "Male",
      "institution": "Delhi Public School, R.K. Puram",
      "photoUrl": null
    },
    "greeting": {
      "lastAssessmentDate": "2026-07-28",
      "completedTests": 4,
      "totalTests": 5,
      "statusLabel": "4/5 Tests Completed"
    },
    "progress": {
      "percent": 80,
      "completed": 4,
      "remaining": 1
    },
    "currentTest": {
      "testId": "sit_ups",
      "name": "Sit-Ups",
      "status": "in_progress",
      "attemptsRemaining": 1,
      "estimatedMinutes": 3
    },
    "tests": [
      {
        "id": "height",
        "key": "height",
        "name": "Height",
        "status": "completed",
        "score": "162 cm",
        "confidence": 96,
        "attempts": 1,
        "maxAttempts": 2,
        "bestAttempt": "162 cm",
        "estimatedMinutes": 2,
        "icon": "ruler"
      }
    ],
    "latestResult": {
      "testName": "30m Sprint",
      "score": "5.1 s",
      "confidence": 93,
      "completedAt": "2026-07-31T09:40:00.000Z",
      "minutesAgo": 18
    },
    "performance": [
      { "key": "height", "label": "Height", "value": "162", "unit": "cm" }
    ],
    "aiInsights": {
      "summary": "Short AI feedback (2–4 lines).",
      "overallConfidence": 91
    },
    "accuracy": {
      "overall": 91,
      "items": [
        { "category": "Anthropometry", "confidence": 95 }
      ]
    },
    "history": [
      {
        "id": "h1",
        "date": "2026-07-28",
        "status": "in_progress",
        "label": "Battery Round 2"
      }
    ],
    "achievements": [
      {
        "id": "a1",
        "name": "First Assessment",
        "description": "Completed your first battery test"
      }
    ],
    "sync": {
      "pendingVideos": 2,
      "pendingResults": 1,
      "pendingReports": 0,
      "lastSyncAt": "2026-07-31T08:55:00.000Z"
    }
  }
}
```

## Notes for Express

- Until this route exists, the app uses mock data in `src/data/mockAthleteDashboard.ts` and caches it in AsyncStorage.
- `currentTest` may be `null` when assessment is complete.
- `latestResult` may be `null` when no test is finished yet.
- `tests` should always include all **10** battery tests.
- `status` values: `"completed" | "pending" | "in_progress"`.
- Suggested TypeScript type: `src/types/athleteDashboard.ts` → `AthleteDashboardData`.

## Client behaviour

| Network | Behaviour |
|---------|-----------|
| Online + API OK | Use API, write AsyncStorage cache |
| Online + API missing/error | Use cache, else mock |
| Offline | Use AsyncStorage cache (or mock if empty) |
