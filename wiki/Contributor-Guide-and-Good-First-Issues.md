# Contributor Guide & Good First Issues

<div align="center">

**Join the Mission to Build Clean, Transparent, and Intelligent Cities**

[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg?style=flat-square)](https://github.com/TheVicky1/Safai_OS/issues)
[![First Timers Friendly](https://img.shields.io/badge/First--Timers--Only-Friendly-7057ff.svg?style=flat-square)](https://github.com/TheVicky1/Safai_OS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-ff79c6.svg?style=flat-square)](https://hacktoberfest.com/)

</div>

---

## 🌟 Why Contribute to SafaiOS?

Whether you are an aspiring open-source contributor, a computer vision researcher, a backend engineer, or a technical writer, **SafaiOS is built for you**:

- ⚡ **Zero-Database Friction**: Run the full application test suite and all **151 automated tests** locally in under 10 seconds without needing a cloud account or local database.
- 🎯 **Scored Micro-Contributions**: Our beginner issues are intentionally scoped into **tiny, single-file tasks** (5 to 30 minutes of work) with exact file pointers and step-by-step acceptance criteria.
- 🚀 **Fast Maintainer Turnaround**: First-time contributor pull requests receive priority review from core maintainers (target turnaround under 48 hours).
- 🏛️ **Permanent Attribution**: Every merged pull request is permanently acknowledged in the repository and celebrated in release notes.
- 🌍 **Civic & Social Good**: Your contributions directly power software that keeps urban streets clean, safe, and transparent.

---

## ⚡ 8-Step Zero-to-PR Quickstart

Follow this streamlined workflow to submit your first contribution:

### 1. Browse Open Issues
Look for issues labeled [`good first issue`](https://github.com/TheVicky1/Safai_OS/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [`help wanted`](https://github.com/TheVicky1/Safai_OS/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22).

### 2. Claim the Issue
Leave a short comment on the issue (e.g., *"I'd like to work on this issue! Please assign it to me."*). A maintainer will assign it to you so work isn't duplicated.

### 3. Fork & Clone
Fork the repository to your own GitHub account and clone it to your local machine:
```bash
git clone https://github.com/<your-username>/Safai_OS.git
cd Safai_OS
```

### 4. Create a Clean Feature Branch
Create a descriptive branch pointing to your issue:
```bash
git checkout -b fix/issue-14-bounding-box-doc
```

### 5. Set Up Local Environment & Run Tests
Set up your virtual environment and verify existing tests:
```bash
python -m venv .venv
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

pip install -e ".[dev]"
pytest tests/ -v
```

### 6. Make Your Changes
Make the minimal, clean code or documentation edits required by your issue.

### 7. Verify Local Quality Gates
Ensure the test suite passes with zero regressions:
```bash
pytest tests/ -v
```

### 8. Commit & Open Your Pull Request
Commit your changes using Conventional Commits and push to your fork:
```bash
git commit -m "docs(taxonomy): clarify glass bottle container boundary examples"
git push origin fix/issue-14-bounding-box-doc
```
Then visit GitHub and click **Compare & pull request**! Link your issue in the description (e.g., `Closes #14`).

---

## 🎯 Curated Good First Issues Catalog

Below are example self-contained micro-contributions ideal for first-time contributors:

| Issue ID | Area | Target File | Scope of Work | Difficulty |
| :---: | :--- | :--- | :--- | :---: |
| **GFI-01** | Documentation | `docs/API.md` | Add JSON schema example for `/api/v1/detect` with 5 sample output boxes. | Easy (15 min) |
| **GFI-02** | Test Utilities | `tests/test_detection_boxes.py` | Add unit test verifying that bounding boxes with zero width raise a clean ValueError. | Easy (20 min) |
| **GFI-03** | Python Package | `src/safaios/utils.py` | Add a helper function `format_confidence_percentage(conf: float) -> str`. | Easy (15 min) |
| **GFI-04** | Documentation | `docs/DEPLOYMENT.md` | Add hardware requirement table comparing Raspberry Pi 5 vs Jetson Orin Nano. | Easy (20 min) |
| **GFI-05** | Python Logging | `src/safaios/logger.py` | Add ISO-8601 UTC timestamp formatting in standard JSON log output. | Easy (25 min) |
| **GFI-06** | Test Coverage | `tests/test_dataset_validator.py`| Add test asserting invalid class IDs (> 4) trigger immediate rejection. | Easy (20 min) |
| **GFI-07** | Documentation | `docs/ARCHITECTURE.md` | Add latency benchmark comparison table across CPU vs GPU vs TensorRT. | Easy (25 min) |
| **GFI-08** | SQL / Database | `supabase/tests/` | Add pgTAP test asserting notification read timestamps cannot be set in the future. | Medium (35 min) |

---

## 🤝 Community Guidelines & Code of Conduct

SafaiOS is committed to providing a welcoming, inclusive, and harassment-free environment for everyone. All contributors and participants are expected to adhere to our [Code of Conduct](https://github.com/TheVicky1/Safai_OS/blob/main/CODE_OF_CONDUCT.md).

### Need Help?
- 💬 **Ask in Discussions**: Have questions or need guidance? Open a thread on [GitHub Discussions](https://github.com/TheVicky1/Safai_OS/discussions).
- 🏷️ **Labels**: Check our issue labels to find tasks matching your skillset (`good first issue`, `documentation`, `python`, `computer-vision`, `sql`).

---

<div align="center">

[← Previous: Safai Coins & Civic Ledger](Safai-Coins-and-Civic-Ledger) | [Next: Local Development & Setup →](Local-Development-and-Environment-Setup)

</div>

