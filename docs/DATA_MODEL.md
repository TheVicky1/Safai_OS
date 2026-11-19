# SafaiOS - Relational Data Model and Database Architecture

This document defines the canonical PostgreSQL database schema, relational entities, Row Level Security (RLS) policies, and ledger protections implemented in `supabase/migrations/20261114125657_safaios_database_foundation.sql`.

---

## 1. Relational Schema Architecture

The SafaiOS database comprises 16 core entities organized around civic reporting, AI waste assessment, automated dispatch, verification, and tamper-proof rewards.

```text
auth.users (Supabase Authentication)
  │
  └── profiles (1:1)
        ├── incidents (1:N)
        │     ├── incident_ai_analyses (1:1)
        │     ├── incident_status_history (1:N)
        │     └── driver_assignments (1:N)
        │           └── cleanup_evidence (1:1)
        │                 └── cleanup_evidence_media (1:N)
        │
        ├── verification_decisions (1:N)
        ├── driver_telemetry (1:N)
        │
        └── safai_coins_wallets (1:1)
              └── safai_coins_transactions (1:N)

municipal_wards
  └── waste_collection_routes (1:N)
        └── route_stops (1:N)

audit_logs (Protected, append-only)
system_settings (Superadmin managed)
```

---

## 2. Entity Specifications

### 2.1 Identity and Access Management
- **`profiles`**: User role profiles linked to `auth.users`. Roles include `citizen`, `driver`, `admin`, and `superadmin`. Stores verified mobile numbers, display names, and account status.

### 2.2 Civic Incidents and AI Analysis
- **`incidents`**: Reported waste dumps containing PostGIS coordinates (`latitude`, `longitude`, `geom`), estimated waste volume, severity level (`low`, `medium`, `high`, `critical`), reporter ID, and lifecycle status (`reported`, `analyzed`, `assigned`, `in_progress`, `cleaned`, `verified`, `rejected`).
- **`incident_ai_analyses`**: Output of the YOLO11s detection inference, including total item count, confidence scores, detected class breakdown (JSONB), and recommended cleanup priority.
- **`incident_status_history`**: Audit trail of incident status transitions with actor timestamps and change reasons.

### 2.3 Dispatch and Operations
- **`driver_assignments`**: Dispatched task linking an approved driver to an incident. Includes dispatch timestamp, route priority, assignment status (`assigned`, `accepted`, `en_route`, `arrived`, `completed`, `cancelled`), and completion timestamps.
- **`cleanup_evidence`**: Post-cleanup proof submitted by the driver, containing before/after comparison notes, collection weight (kg), and disposal site identifier.
- **`cleanup_evidence_media`**: Supporting photographic and video evidence linked to a cleanup evidence submission with Supabase storage URIs.
- **`driver_telemetry`**: GPS breadcrumbs and vehicle status reports emitted during active cleanup shifts.

### 2.4 Governance and Geographic Boundaries
- **`municipal_wards`**: Geographic polygon boundaries for urban wards, administration zones, and supervisor assignments.
- **`waste_collection_routes`**: Planned route geometries and scheduled collection paths within municipal wards.
- **`route_stops`**: Designated pickup waypoints and scheduled stops along collection routes.

### 2.5 Verification and Civic Rewards
- **`verification_decisions`**: Cleanup verification decisions (`approved`, `rejected`, `rework_required`). Enforces strict business logic: **the user who performed the cleanup or an assigned driver cannot verify the cleanup**.
- **`safai_coins_wallets`**: Balances of civic reward tokens earned by citizens. Balances can only be updated by database triggers, preventing direct client manipulation.
- **`safai_coins_transactions`**: Append-only transaction ledger recording every credit or debit with reason codes (`incident_reported`, `cleanup_verified`, `penalty`, `reward_redemption`).

### 2.6 System Auditing and Configuration
- **`audit_logs`**: Append-only security and operational audit trail. Direct client updates or deletions are prohibited.
- **`system_settings`**: Global platform configuration keys (e.g. reward multipliers, verification timeout windows) editable exclusively by `superadmin`.

---

## 3. Storage Bucket Configuration

SafaiOS defines two private storage buckets with strict Row Level Security:

1. **`incident-images`**:
   - Stores initial citizen report photos and camera frames.
   - Read access: Permitted for incident owners, assigned drivers, and municipal administrators.
   - Insert access: Permitted for authenticated citizens creating incidents.

2. **`cleanup-evidence`**:
   - Stores post-cleanup photos submitted by assigned drivers.
   - Read access: Permitted for the reporting citizen (to facilitate verification), assigned driver, and administrators.
   - Insert access: Restricted strictly to the driver assigned to that specific incident.

---

## 4. Row Level Security (RLS) Policy Matrix

| Table | Citizen Permitted | Driver Permitted | Admin Permitted | Superadmin Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Read own profile, update own name/phone | Read own profile, update own name/phone | Read all profiles, manage drivers | Full administrative control |
| `incidents` | Insert new, read own, read public map summaries | Read assigned incidents | Read/update all in assigned ward | Full control |
| `driver_assignments` | Read assignments for own reported incidents | Read own assignments, update assignment status | Create and reassign driver tasks | Full control |
| `cleanup_evidence` | Read evidence for own reported incidents | Insert and read own evidence submissions | Read all evidence | Full control |
| `verification_decisions` | Insert decision for own incidents (if not performer) | None (prevented from self-verification) | Insert override decision | Full control |
| `safai_coins_wallets` | Read own balance | Read own balance | Read all wallets | Read all wallets |
| `safai_coins_transactions` | Read own transactions | Read own transactions | Read all transactions | Read all transactions |
| `audit_logs` | None | None | Read audit logs | Read audit logs |

