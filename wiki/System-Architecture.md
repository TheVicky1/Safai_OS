# System Architecture

<div align="center">

**Multi-Tier, Server-Authoritative Architecture for Scalable Municipal Operations**

</div>

---

## 🏗️ High-Level Architectural Overview

SafaiOS enforces strict structural boundaries between client applications, server business logic, computer vision inference, and durable data storage:

```text
+-------------------------------------------------------------------------+
|                       Presentation Layer (UI Apps)                      |
|                                                                         |
|   +-----------------------+                    +--------------------+   |
|   |  Citizen Mobile / Web |                    | Driver Field App   |   |
|   +-----------------------+                    +--------------------+   |
|               │                                          │              |
|   +-----------------------+                    +--------------------+   |
|   |  Municipal Admin UI   |                    | Public Telemetry   |   |
|   +-----------------------+                    +--------------------+   |
+-------------------------------------------------------------------------+
                                     │
                             HTTPS / JSON APIs
                                     │
+-------------------------------------------------------------------------+
|                  Server-Authoritative Application Layer                 |
|                                                                         |
|   - Incident Lifecycle Controller    - Dispatch & Fleet Engine          |
|   - Verification & Anti-Fraud Guard  - Duplicate Screening Service      |
|   - Safai Coins Transaction Manager  - 7-Day Autonomous Sweeper         |
+-------------------------------------------------------------------------+
                  │                                   │
         Python IPC / REST                     Supabase Client
                  │                                   │
+-----------------------------------+   +---------------------------------+
|     AI Computer Vision Engine     |   |    Database & Storage Layer     |
|                                   |   |                                 |
|   - YOLOInferenceEngine (E002)    |   |   - PostgreSQL 17               |
|   - Letterbox 768px Preprocessor  |   |   - Row-Level Security (RLS)    |
|   - Class-Specific NMS Postprocess|   |   - Private Storage Buckets     |
|   - Bounding Box Normalizer       |   |   - pgTAP Automated Test Suite  |
+-----------------------------------+   +---------------------------------+
```

---

## 🧩 Architectural Tiers

### 1. Presentation Tier (Client Applications)
Client frontends are designed as lightweight, reactive interfaces with zero direct database privileges:
- **Citizen Application**: Geotagged camera capture, report submission, before-and-after review, and coin balance view.
- **Sanitary Driver Application**: Live assignment feed, interactive route guidance, on-site arrival confirmation, and evidence upload.
- **Municipal Admin Command Center**: City-wide incident heatmap, fleet dispatch controls, duplicate assessment review, and resolution overrides.
- **Public Viewer Portal**: High-level municipal cleanliness index and aggregated civic statistics without personal data exposure.

### 2. Application & Workflow Tier
The core business logic is strictly server-authoritative. Clients submit action requests (e.g., `SubmitReport`, `AcceptAssignment`, `SubmitEvidence`, `VerifyCleanup`); the server validates caller identity, active assignment status, and temporal deadlines before executing any transition:
- **Lifecycle Controller**: Transitions incidents across verified states (`DRAFT` → `SUBMITTED` → `ASSIGNED` → `CLEANUP_IN_PROGRESS` → `AWAITING_CITIZEN_VERIFICATION` → `CLOSED`).
- **Anti-Fraud Guard**: Verifies that the verification actor is eligible and disqualifies any actor who participated in the physical cleanup.
- **Autonomous Sweeper**: A background cron worker that evaluates 7-day citizen verification deadlines and escalates expired items to municipal admin review.

### 3. AI Computer Vision Service
The computer vision subsystem operates as an isolated, high-performance internal service:
- Decouples heavy deep learning inference (PyTorch, CUDA, TorchVision) from the web application runtime.
- Exposes clean schema-validated inputs (`image_path` or byte payload) and outputs standardized normalized predictions (`class_id`, `confidence`, `bbox`).
- Evaluates incident media independently of business logic, logging immutable analysis results directly into `public.ai_analysis_results`.

### 4. Database & Storage Tier
Powered by **PostgreSQL 17** within the Supabase ecosystem:
- **100% Row-Level Security (RLS)**: Enforces access control at the database level so that compromised clients cannot execute illegal queries.
- **Hardened Function Execution**: All triggers and database functions enforce explicit `set search_path = public` or `set search_path = public, auth`.
- **Private Scoped Storage**: Media files are hosted in private buckets (`incident-media`, `cleanup-evidence`) requiring user-scoped upload paths and incident-linked read authorizations.

---

## 🔒 Security & Trust Boundaries

```text
[ Client Device ]
        │ (Untrusted Network)
        ▼
[ TLS 1.3 / HTTPS Gateway ]
        │ (JWT Auth Token)
        ▼
[ Server-Authoritative API ] ──► [ Role & Conflict Verification ]
        │                                  │
        ├──────────────────────────────────┤
        ▼                                  ▼
[ Private YOLO Service ]          [ PostgreSQL 17 + RLS ]
(Isolated internal socket)       (Owner & Assignment Predicates)
```

1. **Identity is Not Authority**: Holding an authenticated JWT does not confer administrative rights. The user's role is checked against server-managed `user_roles` and `admin_permissions` tables.
2. **Zero-Trust Direct Access**: Client applications never possess database service-role credentials. All client requests execute under restricted `authenticated` database roles subject to RLS predicates.
3. **Immutable History**: Incident revisions, evidence rejections, and administrative interventions append new records rather than mutating or deleting historical context.

---

<div align="center">

[← Previous: Vision & Civic Impact](Vision-and-Civic-Impact) | [Next: Computer Vision & YOLO11s →](Computer-Vision-and-YOLO11s)

</div>

