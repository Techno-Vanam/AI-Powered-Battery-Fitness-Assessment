# Low-Level Design (LLD) — Draft

> Export to `LLD.pdf` before submission (10–20 pages).

## 1. Database Schema

See [`DB_Schema.sql`](DB_Schema.sql) and ER diagram.

## 2. API Specification

See [`API_Spec.yaml`](API_Spec.yaml).

## 3. AI Model Integration Detail

_[Per test: model file, input tensor, pre/post-processing, output format, code refs]_

## 4. Video Capture Pipeline

_[Camera init, resolution/FPS, frame extraction, compression, metadata, device capabilities]_

## 5. Offline Sync Queue Design

_[Queue structure, retry, chunked upload, conflict resolution, drain on reconnect]_

## 6. Report Card Generation

_[Template engine, PDF library, Hindi/English, offline generation]_

## 7. State Machine Diagrams

_[Battery workflow, individual test workflow, sit-up rep counting, shuttle-run turn detection]_

## 8. Error Handling and Edge Cases

_[Crash mid-test, storage full, permission denied, athlete leaves frame, lighting, multi-person, rotation]_
