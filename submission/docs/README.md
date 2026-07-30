# Architecture & Documentation

Export Markdown drafts to PDF where required before final submission.

## Required documents

| File | Format | Section | Status |
|------|--------|---------|--------|
| `HLD.pdf` | PDF, 8–15 pages | 4.1 High-Level Design | [ ] Draft: `HLD.md` |
| `LLD.pdf` | PDF, 10–20 pages | 4.2 Low-Level Design | [ ] Draft: `LLD.md` |
| `Model_Cards.pdf` | PDF | Section 5 | [ ] Draft: `Model_Cards.md` |
| `Validation_Report.pdf` | PDF | Section 6 | [ ] Draft: `Validation_Report.md` |
| `User_Guide.pdf` | PDF, 2–3 pages + per-test | Section 10 | [ ] Draft: `User_Guide.md` |
| `Known_Issues.md` | Markdown | Section 11 | [ ] Template ready |
| `API_Spec.yaml` | OpenAPI 3.0 | 4.2.2 | [ ] Skeleton ready |
| `DB_Schema.sql` | SQL or ER diagram PNG | 4.2.1 | [ ] Skeleton ready |

## HLD sections to cover

1. System context diagram  
2. Component architecture  
3. AI pipeline overview (≥3 tests)  
4. Data flow and storage  
5. Cloud and sync architecture  
6. Integration design (APAAR, Aadhaar, NSRS)  
7. Security architecture  
8. Scalability approach  

## LLD sections to cover

1. Database schema  
2. API specification  
3. AI model integration detail  
4. Video capture pipeline  
5. Offline sync queue design  
6. Report card generation  
7. State machine diagrams  
8. Error handling and edge cases  
