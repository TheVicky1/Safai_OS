# Incident Lifecycle & Verification

<div align="center">

**Deterministic State Machine, Dual-Actor Verification, and Anti-Fraud Guardrails**

</div>

---

## 🔄 The Complete Incident State Machine

The core operating philosophy of SafaiOS is that no municipal incident may be closed based on unilateral claims. The lifecycle is managed by an authoritative server-side state machine with strict database triggers verifying actor eligibility at every step:

```text
               +----------------------------------+
               |              DRAFT               |  (Citizen creates report, runs YOLO pre-scan)
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |            SUBMITTED             |  (Geotagged report confirmed by citizen)
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |           ADMIN_REVIEW           |  (Duplicate assessment logged; fleet dispatch)
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |             ASSIGNED             |  (Single driver assigned; en route)
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |       CLEANUP_IN_PROGRESS        |  (Driver arrived on site; collecting waste)
               +----------------------------------+
                                │
                                ▼ (Driver submits photographic cleanup evidence)
               +----------------------------------+
               |  AWAITING_CITIZEN_VERIFICATION   |
               +----------------------------------+
                 │              │               │
  Citizen Approves   Citizen Denies   No Response in 7 Days
                 │              │               │
                 ▼              └───────┬───────┘
+-----------------------------+         ▼
|           CLOSED            |  +-----------------------------+
|  (Idempotent Safai Coins)   |  |    AWAITING_ADMIN_REVIEW    |
+-----------------------------+  +-----------------------------+
                                        │               │
                           Admin Approves   Admin Rejects
                                        │               │
                                        ▼               ▼
                        +-----------------+   +---------------------+
                        |     CLOSED      |   | RESOLUTION_REQUIRED |
                        | (Reward Minted) |   | (Rework / Reassign) |
                        +-----------------+   +---------------------+
```

---

## 🛡️ Anti-Fraud Rules & Verifier Eligibility

Traditional civic reporting apps suffer from fraudulent approvals where contractors or workers sign off on their own tasks. SafaiOS enforces strict eligibility logic via database triggers and server-side checks:

### Rule 1: The Self-Verification Ban
A user who performed the physical cleanup (the submitter of `cleanup_evidence`) can **never** verify that cleanup, regardless of other roles they hold:

```sql
if new.status in ('APPROVED', 'DENIED') then
  if new.decided_by = cleanup_performer then
    raise exception 'cleanup performer cannot verify their own cleanup';
  end if;
  ...
end if;
```

### Rule 2: Citizen Verifier Authorization
Only the citizen who originally authored the incident report (`reporter_id`) is authorized to submit a `CITIZEN` verification decision for that incident:

```sql
if new.actor_kind = 'CITIZEN' and new.decided_by <> reporter then
  raise exception 'citizen verification must be performed by the reporting citizen';
end if;
```

### Rule 3: Reporter-Performer Conflict Resolution
If a citizen reports an incident and subsequently cleans it up themselves as an assigned driver or volunteer, they cannot verify the cleanup as a citizen or as an admin. The system forces an escalated administrative review where an independent municipal administrator performs verification:

```sql
if new.actor_kind = 'ADMIN' and new.decided_by = reporter and reporter = cleanup_performer then
  raise exception 'reporter who performed cleanup cannot verify as an admin';
end if;
```

---

## ⏱️ The 7-Day Verification Window & Autonomous Sweeper

To prevent unverified cleanups from hanging indefinitely when a citizen is inactive or unresponsive:

1. **Verification Due Date**: When driver evidence is submitted, `citizen_verification_due_at` is set to `now() + interval '7 days'`.
2. **Autonomous Deadline Sweeper**: A background worker periodically queries for overdue verification items:
   ```sql
   select id from public.incidents
   where lifecycle_status = 'AWAITING_CITIZEN_VERIFICATION'
     and citizen_verification_due_at <= now();
   ```
3. **Escalation to Admin**: Overdue incidents transition to `AWAITING_ADMIN_REVIEW`. The verification record is marked `EXPIRED`, and the municipal admin team is alerted to inspect the driver's photographic evidence.

---

## 🔁 Rejection & Resolution Workflow

When a citizen or municipal admin denies cleanup evidence:

- The incident moves to `RESOLUTION_REQUIRED`.
- The reviewer must provide an explicit rejection note (`rejection_reason`).
- Prior assignments, evidence photos, statements, and audit records remain permanently preserved in the database (rework never deletes history).
- The municipal administrator can:
  1. **Request Rework**: Reopen the assignment for the same driver to address remaining debris.
  2. **Reassign**: Dispatch a different driver or specialized municipal heavy equipment.
  3. **Escalate**: Flag the location for site inspection or structural remediation.

---

<div align="center">

[← Previous: Database & Security Foundation](Database-and-Security-Foundation) | [Next: Safai Coins & Civic Ledger →](Safai-Coins-and-Civic-Ledger)

</div>

