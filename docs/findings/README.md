# Findings

Defects, risks and surprises found while building or verifying, that are **not fixed in the change that found them**. A finding outlives the feature's handoff: `HANDOFF.md` is rewritten and archived per feature, so nothing that must still be fixed lives only there.

## Rules

- One file per finding: `FND-<nnn>-<kebab-title>.md`, numbered in the order found. Never renumber.
- A finding records what was seen and measured, not a guess presented as a cause. Say what is unproven.
- Status: `OPEN` → `IN PROGRESS` → `FIXED` (with the commit or PR) or `WONT FIX` (with the reason and who decided). A fixed finding stays in the folder, with its status updated.
- The change that fixes a finding names it (`FND-nnn`) in its commit and adds the test that would have caught it.
- A finding that changes a requirement or an architecture decision is also reported as `SPEC GAP` / `CONFLICT` or an ADR; this folder doesn't replace those.

## Template

```markdown
# FND-nnn — <title>

Status: OPEN · Found: <date> · Found by: <who/what> · Area: <feature or layer> · Severity: <low/medium/high and why>

## Symptom
## Evidence
## What still works
## Suspected cause (unproven unless stated)
## How to reproduce
## Fix plan
## Related
```

## Index

| ID | Title | Status | Found |
|---|---|---|---|
| [FND-001](FND-001-reset-password-hangs-on-workers.md) | `POST /reset-password` hangs on Cloudflare Workers | OPEN | 2026-10-05 |
| [FND-002](FND-002-gallery-page-save-failed-once-in-e2e.md) | Gallery page render logged `SAVE_FAILED` once during an E2E run | OPEN | 2026-10-05 |
