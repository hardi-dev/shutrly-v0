---
description: Ship verified work — quality gates, preview/staging, smoke test, release notes
argument-hint: "[feature-slug or release name]"
model: claude-sonnet-5-5
effort: medium
---

Use the `spec-driven-vibe-coding` skill and run its **ship** workflow for: **$ARGUMENTS**

1. Confirm the included features have passing verification reports.
2. Run all project quality gates.
3. Deploy to preview/staging when available and smoke-test the critical journey(s) affected.
4. Make sure the docs describe the shipped behavior; write release notes from the skill's `release.md` template.
5. Ask before any production deploy, push, or other outward-facing action.

Finish with the completion report and recommend `/sdv:handoff`.
