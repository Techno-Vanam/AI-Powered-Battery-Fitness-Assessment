# High-Level Design (HLD) — Draft

> Export to `HLD.pdf` before submission (8–15 pages).

## 1. System Context Diagram

_[Diagram: app, athlete/coach, sovereign cloud, APAAR, Aadhaar, NSRS, Khelo India Portal]_

## 2. Component Architecture

_[Diagram: UI, test workflow engine, video capture, AI inference, local DB, sync queue, report generator]_

## 3. AI Pipeline Overview

_[End-to-end pipeline for ≥3 tests: video → pre-process → inference → post-process → measurement → confidence]_

## 4. Data Flow and Storage

_[Encryption, offline queue, crash recovery (WAL/journaling)]_

## 5. Cloud and Sync Architecture

_[Resumable upload, conflict resolution, de-identification gateway]_

## 6. Integration Design

_[APAAR, Aadhaar e-KYC, NSRS — API contracts, NSRS ID auto-creation]_

## 7. Security Architecture

_[Encryption at rest/transit, RBAC, device attestation, video sovereignty]_

## 8. Scalability Approach

_[10,000+ concurrent sessions — stateless API, queue-based processing, DB partitioning]_
