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

