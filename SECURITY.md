# Security Policy

SafaiOS processes sensitive municipal location telemetry, citizen identity profiles, and municipal financial ledgers. We take security vulnerabilities seriously and appreciate responsible disclosure from researchers and the open-source community.

---

## Supported Versions

Only the latest release and the current `main` branch receive active security updates:

| Version | Supported |
| :--- | :--- |
| `main` (Edge) | Yes |
| `< 1.0.0` | Best-effort basis |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a potential security vulnerability in SafaiOS (such as Row Level Security bypasses, unauthenticated API access, cryptographic ledger flaws, or privilege escalation):

1. **Email the Maintainers**: Send details to **security@safaios.org** or open a private advisory directly via GitHub Security Advisories at https://github.com/TheVicky1/Safai_OS/security/advisories.
2. **Include Reproduction Steps**:
   - Detailed description of the vulnerability.
   - Proof-of-concept exploit script or SQL queries demonstrating the vulnerability.
   - Expected impact on municipal deployments, citizen privacy, or ledger integrity.
   - Any suggested mitigations or patches.

---

## Security Response SLA

- **Initial Response**: Within 24 hours of receipt.
- **Triage & Reproduction**: Within 48 hours.
- **Patch Release & Disclosure**: Within 7 days for critical vulnerabilities.

We credit security researchers publicly in our release notes and changelog (unless anonymity is requested).

