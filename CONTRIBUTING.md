# Contributing to SafaiOS

Thank you for your interest in contributing to **SafaiOS**! SafaiOS is an open-source, edge-native municipal operating system that combines computer vision (YOLO11s), real-time citizen reporting, automated driver dispatching, and verifiable civic rewards.

Whether you are improving ML inference pipelines, writing Postgres RLS security policies, adding UI components, or improving documentation, your contributions help build cleaner and more sustainable cities.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect, empathy, and professional courtesy.

---

## Getting Started

1. **Read the Contributor Guide in our Wiki**:
   Visit our [Contributor Guide and Good First Issues](wiki/Contributor-Guide-and-Good-First-Issues.md) for a complete breakdown of current micro-tasks, good first issues (GFI-01 through GFI-08), development environment setup, and review SLAs.
2. **Setup Local Environment**:
   Follow the [Local Development and Environment Setup](wiki/Local-Development-and-Environment-Setup.md) runbook for your platform (Windows, macOS, Linux).
3. **Understand Quality Gates**:
   Review [Testing and Quality Gates](wiki/Testing-and-Quality-Gates.md) to understand the automated checks run against every pull request.

---

## Micro-Contribution Matrix (Good First Issues)

If you are looking for an issue to start with, pick one of our approved micro-issues:

- **GFI-01**: Benchmark and profile YOLO11s inference under varied batch sizes.
- **GFI-02**: Add Roboflow format validation helpers for new polygon bounding boxes.
- **GFI-03**: Implement class-wise IoU threshold sliders in documentation.
- **GFI-04**: Write additional pgTAP tests for municipal route scheduling policies.
- **GFI-05**: Enhance CSV and JSON report exports for municipal audit analytics.
- **GFI-06**: Add synthetic noise models for nighttime low-light detection testing.
- **GFI-07**: Expand end-to-end Pydantic validation tests for driver location streams.
- **GFI-08**: Audit and translate civic reporting documentation into regional Indian languages.

---

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/<your-username>/Safai_OS.git
cd Safai_OS
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Install Dependencies
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -e ".[dev]"
```

### 4. Run Tests Locally
```bash
pytest tests/ -v
```
All 151 unit tests must pass before opening a pull request.

### 5. Verify Security and Links
```bash
node scripts/secret-scan.mjs
node scripts/check-links.mjs
```

### 6. Submit Your Pull Request
- Target the `main` branch.
- Fill out the PR template completely.
- Ensure linear history (no merge commits; rebase onto `main` if needed).
- Our CI pipeline will execute the required status checks:
  - `Quality Gates & Verification (20.x)`
  - `Dependency Health & Vulnerability Scan (20.x)`

Maintainers review PRs within 48 hours. Thank you for contributing to open civic technology!

---

## 🏛️ Contributors Hall of Fame

Every merged contribution is permanently celebrated in our [Contributors Hall of Fame](CONTRIBUTORS.md) and on the [GitHub Contributors Graph](https://github.com/TheVicky1/Safai_OS/graphs/contributors). Thank you for helping build cleaner cities with us!


