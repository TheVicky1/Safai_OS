# SafaiOS - Continuous Integration and Automated Quality Gates

This document defines the automated Continuous Integration (CI) pipeline, quality gate specifications, and branch ruleset configurations governing **SafaiOS**.

---

## 1. Overview of CI Architecture

SafaiOS uses GitHub Actions to enforce rigorous testing, architectural compliance, security policies, and documentation integrity across every commit and pull request.

- **Workflow File**: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- **Triggers**:
  - `push` to `main`
  - `pull_request` targeting `main`
- **Concurrency**: Automatically cancels in-flight redundant runs on branch updates (`cancel-in-progress: true`).
- **Security**: Runs in isolated runner environments with least-privilege permissions. Zero external secret access is required for local test execution.

### 1.1 Concurrency and Matrix Strategy

To conserve compute runner minutes and accelerate feedback cycles for contributors, SafaiOS workflows implement intelligent concurrency controls and matrix strategies:

- **Concurrency Group**: Configured via `group: ${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`. When new commits are pushed to an existing pull request or branch, GitHub Actions automatically identifies active runs within the same workflow and reference group and cancels any obsolete in-progress jobs immediately. This prevents runner queue congestion and ensures CI resources focus exclusively on the latest code change.
- **Strategy Matrix**: The primary quality gate jobs use a matrix strategy with `node-version: [20.x]`. This pins execution to the verified Node.js 20 LTS runtime for JavaScript tools (including secret scanning and link validation scripts), providing deterministic test results while preserving the flexibility to scale test coverage across multiple Node releases in the future without modifying core job definitions.

---

## 2. The 7 Automated Quality Gates

Every CI build executes 7 deterministic quality gates in sequence:

```text
┌────────────────────────────────────────────────────────┐
│             GitHub Actions Quality Gates               │
│                                                        │
│  1. 🧹 Runner Disk Optimization                        │
│  2. 🐍 Python 3.11 & Node 20 Environment Setup         │
│  3. 📦 Dependency Installation (CPU PyTorch Wheel)     │
│  4. 🧪 Python ML & Core Test Suite (151 Tests)         │
│  5. 🗄️ Local Supabase Stack & Database Migration Reset │
│  6. 🔒 pgTAP Database Authorization Suite (24 Tests)   │
│  7. 🛡️ Secret Scan & Documentation Link Verification   │
└────────────────────────────────────────────────────────┘
```

### Gate 1: Runner Disk Optimization
Cleans unnecessary pre-installed toolchains (Android SDK, .NET, CodeQL) to provide over 30 GB of contiguous disk space for containerized database images and machine learning assets.

### Gate 2: Language Toolchain Setup
- Node.js `20.x` LTS for JavaScript tooling, secret scanning, and link checking.
- Python `3.11` with pip dependency caching.

### Gate 3: Python Dependency Installation
To prevent downloading massive 12GB+ CUDA dependencies inside headless CI runners, pip installs the lightweight CPU-only PyTorch wheel before installing frozen dependencies from `requirements.txt`:
```bash
pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir -r requirements.txt
pip install --no-cache-dir -e ".[dev]"
```

### Gate 4: Python Test Suite (151 Tests)
Executes the full Python test suite across dataset pipeline validation, detection box mathematics, greedy matching, stratification, device inspection, and CoarseDropout training protocols:
```bash
pytest tests/ -v
```
All 151 tests must pass (1 expected skip for training rule enforcement).

### Gate 5: Local Supabase Migration Reset
Launches ephemeral Supabase Docker containers and applies all foundation migrations:
```bash
supabase start
supabase db reset
```

### Gate 6: pgTAP Authorization and Database Linting
Runs the 24-test pgTAP authorization harness inside PostgreSQL:
```bash
supabase test db
supabase db lint --level error --fail-on error
```
Tests citizen isolation, driver isolation, self-verification denial, Safai Coins ledger anti-tampering, and storage bucket RLS.

### Gate 7: Security and Link Audits
- **Secret Scanner Unit Tests**: `node scripts/test-secret-scan.mjs` verifies detection of private keys, tokens, and host-aware credentials across 17 rejection and 9 acceptance fixtures.
- **Repository Secret Scan**: `node scripts/secret-scan.mjs` scans all repository files for potential exposed credentials.
- **Link Verification**: `node scripts/check-links.mjs` validates every relative file link and anchor across documentation.

---

## 3. GitHub Branch Ruleset (`Protect Main`)

The `main` branch is protected by the following ruleset:

1. **Require a pull request before merging**: Direct pushes to `main` are blocked.
2. **Require 1 approval**: Must be reviewed by an authorized reviewer.
3. **Dismiss stale approvals**: Pushing new commits automatically dismisses previous reviews.
4. **Require conversation resolution**: All review comments must be marked resolved before merging.
5. **Require linear history**: Merge commits are blocked; squash-and-merge or rebase is enforced.
6. **Required status checks**:
   - `Quality Gates & Verification (20.x)`
   - `Dependency Health & Vulnerability Scan (20.x)`

---

## 4. Local Verification Preflight Runbook

Before submitting a pull request, run the following commands to ensure all checks will pass:

```bash
# 1. Run Python tests
pytest tests/ -v

# 2. Run secret scanner tests and repo scan
node scripts/test-secret-scan.mjs
node scripts/secret-scan.mjs

# 3. Verify documentation links
node scripts/check-links.mjs
```

