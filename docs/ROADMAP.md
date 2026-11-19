# SafaiOS - Strategic Product and Engineering Roadmap

This document outlines the strategic engineering roadmap for **SafaiOS**, tracking completed milestones, active implementations, and future phases.

---

## 1. Roadmap Overview and Lifecycle Phases

```text
┌─────────────────────────────────────────────────────────────┐
│                 SafaiOS Development Lifecycle               │
│                                                             │
│  [ Phase 1: Data Curation & Taxonomy ]  ──> COMPLETED       │
│  [ Phase 2: YOLO11s Vision Backbone ]   ──> COMPLETED       │
│  [ Phase 3: Supabase Database & RLS ]   ──> COMPLETED       │
│  [ Phase 4: Edge API & Driver Dispatch] ──> ACTIVE          │
│  [ Phase 5: Civic PWA & Verification ]  ──> UPCOMING        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Milestone Breakdown

### Phase 1: Data Foundation and Curation (`COMPLETED`)
- Standardized the 5-class municipal waste taxonomy (`plastic_bottle`, `plastic_wrapper_bag`, `paper_cardboard`, `glass_bottle_container`, `metal_can`).
- Curated and validated the **SafaiOS Dataset v10k** (10,000 verified images).
- Implemented SHA256 image deduplication and perceptual hash filtering to eliminate duplicate frames.
- Established strict, deterministic train/val/test splits with zero cross-split data leakage.
- Built automated dataset pipeline validation with 120 dedicated Python tests.

### Phase 2: YOLO11s Vision Backbone and Training (`COMPLETED`)
- Fine-tuned the YOLO11s architecture with 768px letterbox resizing for high-resolution edge detection.
- Developed the E004 CoarseDropout and spatial augmentation protocol to improve robustness under harsh lighting and glare.
- Benchmarked against the cryptographically locked test set and the India Real-World Benchmark.
- Built model export pipelines for ONNX FP16 and TensorRT 10.x engines.
- Created mathematical bounding-box and IoU invariant tests.

### Phase 3: Database Foundation and Security Hardening (`COMPLETED`)
- Implemented the PostgreSQL database schema across 16 core entities in `supabase/migrations/`.
- Configured PostGIS spatial extensions for coordinate indexing and ward geometry management.
- Defined granular Row Level Security (RLS) policies for citizens, drivers, admins, and superadmins.
- Implemented the 24-test pgTAP authorization test suite for automated CI regression testing.
- Built tamper-proof Safai Coins wallet triggers and append-only transaction ledger protections.
- Established self-verification prevention invariants (performers cannot verify their own cleanup).

### Phase 4: Edge Vision API and Automated Dispatch (`ACTIVE`)
- [x] High-throughput FastAPI edge inference gateway with `/v1/detect` and `/v1/detect/batch`.
- [x] Automated systemd service configurations and Docker containerization runbooks.
- [ ] Real-time vehicle stream ingestion for municipal collection trucks.
- [ ] Automated dispatch route optimization integrating PostGIS route waypoints and driver queues.
- [ ] Driver telemetry ingestion and active route monitoring.

### Phase 5: Civic Verification, Citizen PWA and Governance (`UPCOMING`)
- [ ] Progressive Web Application (PWA) for citizen waste reporting and before/after verification.
- [ ] Mobile camera integration with on-device coordinate and timestamp attestation.
- [ ] Municipal admin analytics dashboard for ward-level waste density heatmaps.
- [ ] Civic merchant partner integration for Safai Coins redemption.
- [ ] Community governance tools for municipal transparency reports.

---

## 3. Milestone Delivery Matrix

| Phase | Core Deliverable | Target Timeline | Verification Gate | Status |
| :---: | :--- | :---: | :--- | :---: |
| **Phase 1** | Dataset v10k Curation & Splitting | Q3 2026 | 120 Dataset Pipeline Tests | `COMPLETED` |
| **Phase 2** | YOLO11s 768px Model Training & ONNX Export | Q3 2026 | Frozen Baseline & IoU Math Tests | `COMPLETED` |
| **Phase 3** | Supabase Migrations, RLS & pgTAP Tests | Q4 2026 | 24 pgTAP Tests & DB Linter | `COMPLETED` |
| **Phase 4** | Edge Inference API & Dispatch Gateway | Q4 2026 | FastAPI Contracts & Latency SLAs | `IN PROGRESS` |
| **Phase 5** | Citizen Mobile PWA & Verification Suite | Q1 2027 | Civic Verification E2E Tests | `PLANNED` |

