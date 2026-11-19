# SafaiOS - Developer Setup and Contributing Guide

This guide walks through configuring a local development environment for **SafaiOS**, running the full test suite, launching the local Supabase stack, and contributing to the codebase.

---

## 1. System Prerequisites

Before starting, install the following tools:

- **Python**: Version `3.11` (Python 3.11.x is required for deterministic dependency compatibility).
- **Node.js**: Version `20.x` LTS.
- **Docker**: Docker Desktop (Windows with WSL 2 enabled, or Linux Docker engine).
- **Supabase CLI**: Version `2.x` or latest (`npm install -g supabase` or via package manager).
- **Git**: Git 2.30+.

---

## 2. Step-by-Step Environment Setup

### 2.1 Clone the Repository
```bash
git clone https://github.com/TheVicky1/Safai_OS.git
cd Safai_OS
```

### 2.2 Configure Python Virtual Environment

#### On Windows (PowerShell):
```powershell
# Set execution policy if script activation is restricted
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Create Python 3.11 virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### On Linux / macOS:
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

### 2.3 Install Python Dependencies
To avoid downloading the massive 12GB+ CUDA binary during initial setup, install the CPU PyTorch wheel first, followed by project dependencies:

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install CPU-only PyTorch wheel
pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install frozen dependencies and developer tools
pip install -r requirements.txt
pip install -e ".[dev]"
```

---

## 3. Local Supabase Development Stack

SafaiOS includes a full local Supabase development environment with automated PostgreSQL migrations and pgTAP authorization suites.

### 3.1 Launch Supabase Containers
```bash
# Start local containers (PostgreSQL, Storage, Auth, Studio)
supabase start
```
Once started, you can access the local Supabase Studio dashboard at `http://127.0.0.1:54323`.

### 3.2 Apply Database Migrations
```bash
# Reset database and execute foundation migrations
supabase db reset
```

### 3.3 Run Database pgTAP Authorization Tests
```bash
# Execute the pgTAP test suite (24 tests)
supabase test db
```

### 3.4 Run Database Linter
```bash
# Verify schema rules and function security
supabase db lint --level error --fail-on error
```

---

## 4. Running the Quality Gate Suites

Before opening a pull request, run all automated quality gates locally:

```bash
# 1. Run Python ML and Core test suite (151 tests)
pytest tests/ -v

# 2. Run Secret Scanner fixture tests and repository scan
node scripts/test-secret-scan.mjs
node scripts/secret-scan.mjs

# 3. Run documentation link verification
node scripts/check-links.mjs
```

---

## 5. Contribution Guidelines

1. **Branching**: Create feature branches from `main` with semantic names:
   ```bash
   git checkout -b feat/enhance-driver-evidence-validation
   ```
2. **Commit Messages**: Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
3. **Linear History**: Merge commits are prohibited on `main`. Always rebase onto upstream `main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
4. **Preservation Rule**: Never modify frozen ML checkpoints, dataset files, or frozen baseline parameters.

