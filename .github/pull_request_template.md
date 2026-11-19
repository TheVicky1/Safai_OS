## Description

Please describe the changes proposed in this pull request. Explain the context, motivation, and which problem or issue it resolves.

Fixes #(issue)

---

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update (Wiki, README, docstrings)
- [ ] ML/Dataset enhancement (YOLO11s evaluation, data pipeline, metrics)
- [ ] Supabase / Database change (migrations, RLS policies, pgTAP tests)

---

## Pre-Merge Quality Verification Checklist

Before submitting this PR, please verify:

- [ ] My code follows the code style guidelines of this project.
- [ ] I have performed a self-review of my code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have updated the documentation in `wiki/` corresponding to my changes.
- [ ] Python unit tests pass locally: `pytest tests/ -v` (151 tests passed).
- [ ] Supabase database tests pass locally: `supabase test db` (24 pgTAP tests passed).
- [ ] Database schema linting passes: `supabase db lint --level error --fail-on error`.
- [ ] Secret scan passes: `node scripts/secret-scan.mjs`.
- [ ] Markdown link check passes: `node scripts/check-links.mjs`.
- [ ] My commits conform to linear history without merge commits.
- [ ] I understand this PR will be squash-merged into `main`.

