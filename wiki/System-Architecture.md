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
