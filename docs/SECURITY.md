# SafaiOS - Security Architecture, Threat Model and RBAC

This document outlines the security architecture, threat model, Role-Based Access Control (RBAC), Row Level Security (RLS) enforcement, and cryptographic protections implemented in **SafaiOS**.

---

## 1. Threat Model

SafaiOS coordinates civic actions, field operations, and financial reward incentives. The architecture addresses five primary threat vectors:

| Threat Vector | Attack Scenario | Architectural Defense |
| :--- | :--- | :--- |
| **Spoofed Cleanup Evidence** | A driver uploads stock photos or unverified images claiming cleanup completion. | PostGIS coordinate verification, EXIF timestamp matching, and mandatory citizen photo verification. |
| **Reward Farming / Sybil** | Users generate fake incidents to farm Safai Coins. | Geolocation deduplication, YOLO11s minimum confidence threshold, and verified cleanup gate prior to coin issuance. |
| **Driver Self-Verification** | A driver approves their own cleanup evidence to bypass inspection. | PostgreSQL database trigger and RLS constraint explicitly blocking the performer from verifying the work. |
| **Direct Balance Tampering** | An authenticated client attempts to modify their `safai_coins_wallets.balance`. | Direct updates to `balance` are revoked; balances can only change via trigger-enforced ledger transactions. |
| **Private Image Scraping** | Unauthorized third parties download civic incident photos. | Supabase storage RLS policies restrict bucket access to incident owners, assigned drivers, and administrators. |

---

## 2. Roles and Access Control (RBAC)

SafaiOS defines four distinct user roles stored in the `profiles.role` column and evaluated in RLS policies:

1. **`citizen`**:
   - Reports waste incidents with geotagged imagery.
   - Tracks status of own reported incidents.
   - Verifies completed cleanups for own incidents (provided they did not perform the cleanup).
   - Views own Safai Coins wallet balance and transaction ledger.

2. **`driver`**:
   - Views dispatched assignments within assigned municipal routes.
   - Updates assignment lifecycle (`accepted`, `en_route`, `arrived`, `completed`).
   - Uploads post-cleanup evidence and waste weight measurements.
   - Prohibited from verifying their own work or accessing unassigned citizen data.

3. **`admin`**:
   - Manages municipal routes, ward boundaries, and driver dispatch queues.
   - Reviews flagged incidents, disputed cleanups, and driver telemetry.
   - May provide administrative verification overrides.

4. **`superadmin`**:
   - Platform maintenance, global system configuration, role promotion, and audit log inspection.

---

## 3. Critical Verification and Reward Policies

### 3.1 Self-Verification Prevention Rule
To maintain civic trust and eliminate collusion, the database enforces the following strict invariant in `verification_decisions`:
- A cleanup performer cannot verify their own work.
- If a reporting citizen performs the cleanup, they cannot verify their own submission.
- Unassigned drivers cannot submit verification decisions.

### 3.2 Safai Coins Immutable Ledger
- Client applications have `SELECT` privileges only on `safai_coins_wallets` and `safai_coins_transactions`.
- Every credit or debit is inserted into `safai_coins_transactions` by trusted server functions or database triggers.
- An integrity trigger automatically recomputes and updates the corresponding wallet balance. Direct `UPDATE` or `DELETE` on wallets is blocked.

### 3.3 Storage Bucket Security
- **`incident-images` Bucket**: Private. Objects are namespaced by incident ID and accessible only to the reporting user, assigned drivers, and municipal administrators.
- **`cleanup-evidence` Bucket**: Private. Writable only by the driver assigned to the corresponding assignment ID.

---

## 4. Database Function Hardening

All custom PostgreSQL functions in `supabase/migrations/` follow strict security hardening rules:
1. **Explicit Search Path**: Every function specifies `set search_path = public, extensions` to prevent search path injection attacks.
2. **Least Privilege Execution**: Default `EXECUTE` privileges are revoked from `public` and granted explicitly to `authenticated` or specific roles.
3. **SECURITY DEFINER Audit**: Used exclusively for operations requiring privileged ledger updates or audit logging, with caller identity validated via `auth.uid()`.

---

## 5. Reporting a Security Vulnerability

If you discover a security vulnerability in SafaiOS, please report it responsibly:
- Email: `security@safaios.org`
- GitHub: Submit a confidential security advisory through [GitHub Security Advisories](https://github.com/TheVicky1/Safai_OS/security/advisories).
- Please do not disclose vulnerabilities in public GitHub issues.

