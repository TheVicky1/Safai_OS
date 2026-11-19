# SafaiOS - Comprehensive Testing and Verification Runbook

SafaiOS enforces an automated, dual-engine testing strategy: Python tests validate computer vision, dataset pipelines, and mathematical bounding-box logic, while PostgreSQL pgTAP tests validate database schemas, Row Level Security (RLS), and financial ledger protections.

---

## 1. Testing Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                 SafaiOS Verification Suite                  │
│                                                             │
│  [ Python ML & Core Suite ]     [ Database pgTAP Suite ]    │
│  - 151 Tests (pytest)           - 24 Tests (pgTAP)          │
│  - Dataset Leakage & Splitting  - Citizen / Driver Isolation │
│  - IoU & Box Math Invariants    - Self-Verification Denials │
│  - Stratification Logic         - Immutable Wallet Ledgers  │
│                                                             │
│  [ Security & Secret Scan ]     [ Link Integrity Audit ]    │
│  - 17 Rejection Fixtures        - 22 Markdown Documents     │
│  - 9 Acceptance Fixtures        - Zero Broken Relative Links │
│  - Whole-repo Static Scan       - Anchor Resolution         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Python Test Suite (151 Tests)

The Python test suite is executed using `pytest` and verifies every layer of the data pipeline and vision engine.

### 2.1 Test File Breakdown

| Test File | Focus Area | Test Count |
| :--- | :--- | :---: |
| `tests/test_dataset_pipeline.py` | Corrupt image rejection, duplicate filtering, zero cross-split leakage, manifest schema validation, provenance tracking | 120 |
| `tests/test_detection_boxes.py` | Bounding box normalization, inverted coordinate rejection, IoU computation, box format conversions (`xyxy` to `xywh`) | 5 |
| `tests/test_detection_matcher.py` | Greedy matching algorithm, true positives, false positives, and confusion matrices | 2 |
| `tests/test_detection_stratification.py` | Pairwise overlap stratum (IoU >= 0.10) and relative scale tiers (small, medium, large) | 2 |
| `tests/test_device.py` | Optimal compute device resolution (CUDA, MPS, CPU) and telemetry profiling | 2 |
| `tests/test_environment.py` | Operating system environment inspection and runtime dependency validation | 1 |
| `tests/test_exporter.py` | Export configuration checks for ONNX and TensorRT | 2 |
| `tests/test_inference_engine.py` | Detector lazy loading and model parameter verification | 2 |
| `tests/test_inference_postprocess.py` | Confidence threshold filtering and class-specific Non-Maximum Suppression (NMS) | 2 |
| `tests/test_logger.py` | JSON structured log formatting and audit log emission | 2 |
| `tests/test_profiler.py` | Latency benchmarking and throughput tracking | 1 |
| `tests/test_train_e004_coarsedropout.py` | E004 CoarseDropout augmentation protocol, frozen baseline controls | 4 |
| `tests/test_api_schemas.py` | Detection response schema validation and payload serialization | 1 |
| `tests/test_dataset_augmentation.py` | Horizontal flip and bounding box geometric transformations | 2 |
| `tests/test_dataset_statistics.py` | Class distribution histogram and balance computation | 1 |
| `tests/test_dataset_validator.py` | YOLO label syntax, coordinate bounds, and class ID range verification | 2 |

### 2.2 Running Python Tests
```bash
pytest tests/ -v
```
Expected output:
```text
======================= 151 passed, 1 skipped in 15.08s =======================
```
*(Note: `test_120_no_yolo_training_rule_enforced` is skipped by default to prevent accidental training launches during CI).*

---

## 3. Database pgTAP Test Suite (24 Tests)

Database security, Row Level Security (RLS) policies, and ledger triggers are validated using **pgTAP** against the local Supabase PostgreSQL container.

### 3.1 Test Coverage Areas
1. **Citizen Isolation**: Verifies Citizen A cannot read, modify, or delete incidents belonging to Citizen B.
2. **Driver Isolation**: Verifies Driver A cannot view Driver B's assignments or submit evidence for unrelated incidents.
3. **Self-Verification Denial**: Verifies that cleanup performers or assigned drivers are prevented from verifying their own work.
4. **Safai Coins Protection**: Verifies that direct client updates to wallet balances fail, and credits only occur through trigger-enforced ledger transactions.
5. **Storage Bucket Policies**: Verifies that unauthorized users cannot read or write private incident or cleanup evidence photos.

### 3.2 Running pgTAP Tests
```bash
supabase test db
```
Expected output:
```text
/home/runner/work/Safai_OS/Safai_OS/supabase/tests/database_foundation.test_test.sql .. ok
All tests successful.
Files=1, Tests=24,  0 wallclock secs
Result: PASS
```

---

## 4. Database Linting

Runs the official Supabase database linter to check for schema errors, unindexed foreign keys, or insecure function definitions:

```bash
supabase db lint --level error --fail-on error
```
Expected output:
```text
No schema errors found
```

---

## 5. Security Scanner and Link Verification

SafaiOS includes automated static analysis tools to verify repository safety:

### 5.1 Secret Scanner Unit Tests
Tests pattern matching across private key formats, tokens, and local vs remote connection strings:
```bash
node scripts/test-secret-scan.mjs
```
Expected output:
```text
[PASS] Verified 17/17 credential rejections.
[PASS] Verified 9/9 documented placeholder acceptances.
```

### 5.2 Whole-Repository Secret Scan
Scans every tracked file for leaked cloud credentials, API keys, or private key blocks:
```bash
node scripts/secret-scan.mjs
```
Expected output:
```text
Secret scan passed: Clean repository (132 files scanned).
```

### 5.3 Documentation Link Verification
Audits all markdown files to ensure zero broken relative links or anchors:
```bash
node scripts/check-links.mjs
```
Expected output:
```text
Link verification passed: All markdown references valid.
```

