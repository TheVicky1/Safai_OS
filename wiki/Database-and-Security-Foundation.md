# Database & Security Foundation

<div align="center">

**PostgreSQL 17 Schema, Zero-Trust Row-Level Security, and Storage Isolation**

</div>

---

## 🗄️ Database Architecture Overview

SafaiOS relies on **PostgreSQL 17** within the **Supabase** ecosystem as its durable source of truth. The database is not merely a passive datastore; it acts as an active security perimeter enforcing business constraints, role separation, and tamper-resistant audit trails directly within the SQL engine.

### Core Security Guarantees
- **100% RLS Coverage**: Row-Level Security is explicitly enabled on every application table.
- **Search Path Hardening**: Every PL/pgSQL function and trigger specifies an immutable `search_path` to eliminate search-path injection vulnerabilities.
- **Privilege Separation**: Unprivileged public execution rights are revoked from internal database functions.
- **Private Media Isolation**: All uploaded images reside in private buckets with path-scoped ownership verification.

---

## 📋 The 16 Relational Entities

The database foundation defines 15 primary application entities plus the supporting evidence-media junction:

| Entity Name | Primary Purpose | Security & Integrity Constraints |
| :--- | :--- | :--- |
| **`profiles`** | User application identity, display name, and account status | 1-to-1 with `auth.users`. Protected from client privilege escalation via triggers. |
| **`user_roles`** | Active role grants (`CITIZEN`, `DRIVER`, `ADMIN`, `VIEWER`, `SUPERADMIN`) | Unique active role per user. Only server or Superadmin workflows may grant roles. |
| **`admin_permissions`** | Fine-grained administrative permissions for staff accounts | Unique active permission keys; restricted grant workflows. |
| **`incidents`** | Central waste reports with coordinates, description, and status | Coordinates validated between (-90, 90) and (-180, 180); RLS restricts read to owner, assigned driver, or admin. |
| **`incident_media`** | Metadata for report and cleanup photographs with SHA-256 hashes | Unique `(storage_bucket, object_path)`. Validated by storage trigger. |
| **`ai_analysis_results`** | Immutable detector outputs, bounding boxes, and checkpoint hashes | Read-only for authorized incident viewers; server-only insertion. |
| **`duplicate_assessments`** | Spatio-temporal candidate match scores between incident pairs | Unique versioned pair index; backend/admin assessment only. |
| **`driver_assignments`** | Historical dispatch log tracking driver assignment lifecycles | Enforces at most one active assignment (`ASSIGNED`, `ACCEPTED`, `EN_ROUTE`, `IN_PROGRESS`) per incident. |
| **`cleanup_evidence`** | Driver cleanup statements, timestamps, and review statuses | Must reference an active assignment matching the submitting driver. |
| **`cleanup_evidence_media`**| Many-to-many junction connecting evidence records to media files | Enforces that attached media was uploaded by the assigned driver. |
| **`verification_decisions`**| Citizen or admin approval, denial, or expiration decisions | Enforces actor eligibility and prevents self-verification fraud. |
| **`citizen_feedback`** | Post-resolution citizen ratings (1 to 5) and feedback notes | One feedback submission per author per incident. |
| **`safai_coin_accounts`** | Balance-bearing user rewards accounts | Unique per user profile; mutated exclusively via server transactions. |
| **`safai_coin_transactions`**| Immutable append-only financial ledger of reward credits and debits | Unique index prevents duplicate `REWARD_CREDIT` transactions per incident. |
| **`audit_logs`** | Append-only system security log capturing actor, entity, and diffs | Immutable; ordinary users cannot insert, update, or delete records. |
| **`notifications`** | Event-driven user notification queue with read timestamps | Users may only read and mark their own notifications as read. |

---

## 🛡️ Row-Level Security (RLS) Policy Model

