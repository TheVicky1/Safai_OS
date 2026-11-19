# Local Development & Environment Setup

<div align="center">

**Complete Installation Runbook for Windows, macOS, and Linux**

</div>

---

## 💻 System Prerequisites

Before setting up SafaiOS locally, ensure the following core tools are installed:

| Tool | Minimum Version | Purpose |
| :--- | :---: | :--- |
| **Git** | `2.38+` | Source control management and branching |
| **Python** | `3.11.x` | Core ML runtime, dataset pipelines, and regression tests |
| **Docker Desktop** | `4.x+` (Linux engine) | Local Supabase stack (Postgres 17, Storage, Auth, Studio) |
| **Supabase CLI** | `2.x+` | Local database migrations, pgTAP tests, and linter |

---

## 🐧 1. Standard Setup (macOS / Linux)

### Step 1: Clone the Repository
```bash
git clone https://github.com/TheVicky1/Safai_OS.git
cd Safai_OS
```

### Step 2: Configure Python Virtual Environment
```bash
# Create dedicated virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Upgrade pip and install package in editable development mode
pip install --upgrade pip
pip install -e ".[dev]"
```

### Step 3: Verify the Python Test Suite
```bash
# Run all 151 unit and regression tests
pytest tests/ -v
```

### Step 4: Configure Environment Variables
```bash
cp .env.example .env
```

---

## 🪟 2. Windows 11 / 10 Setup Guide

Windows development requires special attention to execution policies and Docker Desktop WSL integration.
