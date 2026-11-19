# Safai Coins & Civic Ledger

<div align="center">

**Cryptographic, Idempotent Civic Reward Ledger for Community Cleanliness**

</div>

---

## 🪙 What are Safai Coins?

**Safai Coins** are digital civic utility credits earned by citizens who actively participate in urban sanitation by reporting waste dumps that are subsequently verified as cleaned.

Rather than relying purely on passive civic altruism, Safai Coins align individual citizen incentives with public cleanliness. When an incident is verified as cleaned by the reporting citizen (or municipal admin), the system automatically issues a reward credit directly to the citizen's balance.

---

## 🏛️ The Immutable Ledger Architecture

Safai Coins operate on a strict, server-authoritative, append-only financial ledger model within PostgreSQL 17:

```text
+-----------------------+              +------------------------------+
|  safai_coin_accounts  | 1 ─────── *  |   safai_coin_transactions    |
+-----------------------+              +------------------------------+
| id: UUID (PK)         |              | id: UUID (PK)                |
| owner_id: UUID (FK)   |              | account_id: UUID (FK)        |
| created_at: TIMESTAMPTZ|             | incident_id: UUID (FK)       |
| updated_at: TIMESTAMPTZ|             | transaction_type: ENUM       |
+-----------------------+              | status: ENUM ('POSTED')      |
                                       | amount: BIGINT (> 0)         |
                                       | idempotency_key: TEXT (UQ)   |
                                       | metadata: JSONB              |
                                       | created_at: TIMESTAMPTZ      |
                                       +------------------------------+
```

### Ledger Core Guarantees
1. **Append-Only History**: Balances are calculated by aggregating posted transaction rows; transaction records are never updated or deleted.
2. **Client Mutation Block**: Ordinary users and client applications hold strictly read-only access to their own account rows and transactions via RLS.
3. **Integer Precision**: Coin amounts are stored as 64-bit integers (`BIGINT`), eliminating floating-point rounding errors.

---

## 🔒 Idempotency & Anti-Double-Spend Protection

In real-world distributed systems, network retries and duplicate HTTP requests frequently cause double-crediting. SafaiOS implements a two-tier database guardrail:

### 1. Global Idempotency Key Uniqueness
Every transaction requires an immutable, cryptographically unique `idempotency_key` (length 16 to 200 characters):
```sql
unique (idempotency_key)
```

### 2. Single-Reward-Per-Incident Index
To guarantee that an incident report can **never** trigger multiple reward payouts under any race condition, the database enforces a partial unique index:
```sql
create unique index safai_coin_transactions_one_reward_per_incident_idx
  on public.safai_coin_transactions (incident_id, transaction_type)
  where transaction_type = 'REWARD_CREDIT' and status = 'POSTED';
```
Any secondary attempt to insert a `REWARD_CREDIT` for an already-rewarded incident fails immediately with a PostgreSQL unique violation (`23505`), preventing duplicate credits.

---

## 📊 Transaction Types & Lifecycles

| Transaction Type | Direction | Trigger Condition |
| :--- | :---: | :--- |
| **`REWARD_CREDIT`** | `+` (Credit) | Minted upon confirmed verification and closure of an incident report. |
| **`REDEMPTION_DEBIT`** | `-` (Debit) | Deducted when a citizen redeems coins for approved civic benefits. |
| **`ADJUSTMENT`** | `+` / `-` | Administrative correction executed under strict Superadmin audit. |
| **`REVERSAL`** | `+` / `-` | Voiding of a previous transaction due to fraud detection or dispute. |

---

## ⚡ Future Municipal Redemption Roadmap

Safai Coins are architected to integrate seamlessly with public utility billing systems:

- **Electricity & Water Subsidies**: Direct credit rebates against monthly municipal electricity or water bills.
- **Public Transit Credits**: Metro and bus transit smartcard balance top-ups.
- **Composting & Recycling Kits**: Subsidized municipal organic compost bins and waste segregation liners.
- **Civic Leaderboards**: Public neighborhood cleanliness ratings and recognition for active citizen stewards.

---

<div align="center">

[← Previous: Incident Lifecycle & Verification](Incident-Lifecycle-and-Verification) | [Next: Contributor Guide & Good First Issues →](Contributor-Guide-and-Good-First-Issues)

</div>

