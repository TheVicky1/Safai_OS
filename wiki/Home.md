<h1 align="center">Welcome to the SafaiOS Official Wiki</h1>

<div align="center">

**The Intelligence Behind Cleaner Cities**  
*Detect. Act. Verify.*

[![License: MIT](https://img.shields.io/badge/License-MIT-00c853.svg?style=flat-square)](https://github.com/TheVicky1/Safai_OS/blob/main/LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![YOLO11s](https://img.shields.io/badge/YOLO-11s-00599C.svg?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg?style=flat-square)](Contributor-Guide-and-Good-First-Issues)

</div>

---

## 🌟 What is SafaiOS?

**SafaiOS** is a next-generation open-source **Civic Waste Intelligence & Municipal Operating System**. It bridges the gap between citizens, municipal sanitation fleets, and urban administrators by pairing cutting-edge computer vision with a zero-trust, server-authoritative database foundation.

Unlike legacy municipal reporting portals where complaints disappear into bureaucratic black holes, SafaiOS introduces **verifiable proof-of-work cleanup protocols**:
- **Real-Time AI Detection**: Automated waste localization and material categorization powered by a customized **YOLO11s** backbone trained on 10,000+ audited images.
- **Deterministic Fleet Dispatch**: Automated dispatch and routing for sanitation drivers with single-active-assignment enforcement.
- **Dual-Actor Visual Verification**: Before-and-after photographic evidence verified directly by the reporting citizen, with automated 7-day administrative escalation.
- **Anti-Fraud Security**: Strict disqualification preventing cleanup performers from verifying their own work under any circumstance.
- **Civic Incentives**: Idempotent **Safai Coins** minted to citizens upon confirmed cleanup verification.

---

## 🧭 Wiki Table of Contents

Navigate the complete SafaiOS technical and operational documentation below:

### 🏛️ Architecture & Core Philosophy
1. [**Vision & Civic Impact**](Vision-and-Civic-Impact) - The urban sanitation crisis, municipal accountability, and civic tech vision.
2. [**System Architecture**](System-Architecture) - End-to-end component boundaries, client apps, server API, and database layer.
3. [**Computer Vision & YOLO11s**](Computer-Vision-and-YOLO11s) - Model evolution (`E001`-`E004`), 768px input pipeline, waste taxonomy, and evaluation.
4. [**Database & Security Foundation**](Database-and-Security-Foundation) - 16 relational entities, Row-Level Security (RLS), and private storage rules.
5. [**Incident Lifecycle & Verification**](Incident-Lifecycle-and-Verification) - State machine transitions, proof-of-work evidence, and anti-fraud enforcement.
6. [**Safai Coins & Civic Ledger**](Safai-Coins-and-Civic-Ledger) - Idempotent reward transaction architecture and municipal utility redemption.

### 🛠️ Developer & Contributor Hub
7. [**Contributor Guide & Good First Issues**](Contributor-Guide-and-Good-First-Issues) - Start here! Zero-database micro-contributions, 5-30 min tasks, and PR guide.
8. [**Local Development & Environment Setup**](Local-Development-and-Environment-Setup) - Complete setup runbook for Windows (WSL 2), macOS, and Linux.
9. [**Testing & Quality Gates**](Testing-and-Quality-Gates) - Automated test matrix (151 Python suites, pgTAP database tests, db linting).
10. [**Troubleshooting & FAQ**](Troubleshooting-and-FAQ) - Solutions for Docker, WSL, Python environments, and database migrations.

---

## 🚀 Why Contribute to SafaiOS?

SafaiOS is built with high engineering craft and is deliberately designed to be one of the most welcoming open-source projects on GitHub:

- ⚡ **Zero-Database Local Testing**: Run the complete **151-suite Python regression matrix** immediately in `.venv` without needing a local database or cloud account.
- 🎯 **Laser-Focused Micro-Issues**: Contributor tasks are cleanly scoped to single files with concrete acceptance criteria and zero ambiguity.
- 🏎️ **Fast Review Turnaround**: Core maintainers prioritize first-time contributor pull requests with a target turnaround under 48 hours.
- 🌍 **Real Civic Impact**: Your code contributes directly to cleaner streets, transparent governance, and environmental sustainability.

👉 **Ready to get started?** Head over to our [**Contributor Guide & Good First Issues**](Contributor-Guide-and-Good-First-Issues) to pick your first task!

---

## 🔍 Key Project Specifications

| Attribute | Specification |
| :--- | :--- |
| **Repository** | `TheVicky1/Safai_OS` |
| **Primary Languages** | Python 3.11, PL/pgSQL, TypeScript / SQL |
| **Vision Model** | Ultralytics YOLO11s (768px, conf 0.25, NMS IoU 0.60) |
| **Dataset Scale** | `SafaiOS_Dataset_v10k` (10,000+ curated street waste images) |
| **Taxonomy Classes** | Plastic Bottle, Wrapper/Bag, Paper/Cardboard, Glass, Metal Can |
| **Database Engine** | PostgreSQL 17 (Supabase local stack) |
| **Security Coverage** | Row-Level Security (RLS) enabled on 100% of tables |
| **Automated Test Matrix**| 151 Python unit tests + 24 pgTAP database authorization tests |
| **License** | MIT License |

---

<div align="center">

**SafaiOS - The Intelligence Behind Cleaner Cities.**  
[Main Repository](https://github.com/TheVicky1/Safai_OS) · [Issue Tracker](https://github.com/TheVicky1/Safai_OS/issues) · [Discussions](https://github.com/TheVicky1/Safai_OS/discussions)

</div>

