# SafaiOS Documentation Hub

Welcome to the canonical documentation for **SafaiOS** - an open-source, edge-native computer vision operating system for real-time municipal waste detection, automated driver dispatch, and verified civic cleanup rewards.

> 🚀 **Operating Principle**: Detect. Act. Verify.  
> 🏷️ **Core Architecture**: YOLO11s (768px letterbox) + Edge Inference + Supabase PostgreSQL (RLS & pgTAP)

---

## Documentation Directory

```
docs/
├── README.md                  # Master Documentation Hub and Navigation Sitemap
├── ARCHITECTURE.md            # Vision Pipeline, System Architecture and Edge Topology
├── DATA_MODEL.md              # Relational Database Schema, 16 Entities and RLS Policies
├── API.md                     # Detection REST API, Schemas and Integration Contracts
├── DEVELOPMENT.md             # Developer Environment Setup, Tooling and Contributing Guide
├── DEPLOYMENT.md              # Hardware Tiers, ONNX/TensorRT Export and Production Runbook
├── CI_PIPELINE.md             # GitHub Actions CI Workflows and Automated Quality Gates
├── SECURITY.md                # Security Architecture, Threat Model and RBAC Matrix
├── TESTING.md                 # Test Suite Runbook (Python 151 Tests and pgTAP 24 Tests)
├── EVALUATION_METHODOLOGY.md  # Stratification Tiers, Operating Points and Benchmark Metrics
└── ROADMAP.md                 # Strategic Engineering Roadmap Across Phases 1 to 5
```

---

## Master Documentation Matrix

| Document | Primary Focus | Key Audience | Implementation Status |
| :--- | :--- | :--- | :--- |
| [**Architecture Specification**](ARCHITECTURE.md) | Vision pipeline, 768px letterbox inference, and waste taxonomy | CV Engineers, System Architects | `COMPLETED` |
| [**Relational Data Model**](DATA_MODEL.md) | 16 database entities, foreign keys, RLS policies, and storage | Backend Developers, DBA | `COMPLETED` |
| [**Detection API Specification**](API.md) | `/v1/detect` contracts, response schemas, and latency SLAs | API Consumers, Mobile/Web Devs | `COMPLETED` |
| [**Developer Setup Guide**](DEVELOPMENT.md) | Local environment, Python venv, Supabase CLI, and runbooks | All Contributors | `COMPLETED` |
| [**Deployment Runbook**](DEPLOYMENT.md) | Jetson Orin/Nano, TensorRT export, systemd, and Docker | DevOps, Edge Engineers | `COMPLETED` |
| [**CI Pipeline and Quality Gates**](CI_PIPELINE.md) | GitHub Actions workflows, matrix checks, and branch ruleset | Maintainers, Contributors | `COMPLETED` |
| [**Security and RBAC**](SECURITY.md) | Role boundaries, verifier eligibility, and audit protections | Security Engineers, Auditors | `COMPLETED` |
| [**Testing Runbook**](TESTING.md) | 151 Python tests, 24 pgTAP tests, secret scanner, and links | QA, Test Automation | `COMPLETED` |
| [**Evaluation Methodology**](EVALUATION_METHODOLOGY.md) | Operational operating points, IoU, and scale stratification | Data Scientists, Evaluators | `COMPLETED` |
| [**Product and Tech Roadmap**](ROADMAP.md) | Strategic phases from Foundation to Civic Governance | Product Leads, Community | `COMPLETED` |

---

## Contributor Quick Links

- **New Contributors**: Start with [DEVELOPMENT.md](DEVELOPMENT.md) to set up your local workspace and Python environment.
- **Computer Vision Developers**: Review [ARCHITECTURE.md](ARCHITECTURE.md) and [EVALUATION_METHODOLOGY.md](EVALUATION_METHODOLOGY.md) for model weights and dataset splits.
- **Backend & Database Engineers**: Read [DATA_MODEL.md](DATA_MODEL.md) and [SECURITY.md](SECURITY.md) before writing migrations or RLS policies.
- **Submitting Pull Requests**: Verify all gates outlined in [CI_PIPELINE.md](CI_PIPELINE.md) and [TESTING.md](TESTING.md) before pushing commits.

---

## Documentation Standards

All documentation in SafaiOS must adhere to the following principles:
1. **Pristine Markdown**: Standard GitHub Flavored Markdown with clean tables, explicit link paths, and structured headings.
2. **Deterministic Links**: Every relative file reference must point to a valid file path validated by `scripts/check-links.mjs`.
3. **Single Dash Typography**: Avoid em-dashes and en-dashes; use standard hyphens and single dashes `-`.
4. **Credential Isolation**: Documented example commands must use approved placeholder tokens (`postgres_password_here`, `your-anon-public-key-here`).

