---
description: Bootstrap or adopt a project — product, domain, feature map, stack, constitution, coding rules
argument-hint: "[idea or path to existing notes]"
model: claude-sonnet-5-5
effort: high
---

Use the `spec-driven-vibe-coding` skill and run its **init-project** workflow.

Input: $ARGUMENTS

1. Inspect the repo first. If `docs/` or other planning documents already exist, **adopt** them: migrate decisions into the standard `docs/` layout without re-opening them. Otherwise run discovery from the idea above.
2. Product discovery → `docs/product/overview.md`, `scope.md`, `user-journeys.md`.
3. Domain discovery → `docs/domain/business-rules.md` (stable `BR-<AREA>-NNN` IDs), `domain-model.md`. Ask only questions that materially change behavior.
4. Feature map → `docs/product/feature-map.md` with feature IDs, slugs, related rules, and status.
5. Stack → `docs/architecture/tech-stack.md`, `overview.md`, ADRs in `docs/architecture/decisions/`. Record user/repo constraints; do not reopen them. Mark unconfirmed choices as PROPOSED.
6. Guardrails → `docs/constitution.md`, `docs/coding-rules.md`.
7. Start from the skill's `assets/templates/`; drop unused sections.

Finish with the skill's completion report: artifacts created, `SPEC GAP` / `CONFLICT` list, decisions needing confirmation, and the next recommended command (usually `/sdv:discover-feature <slug>`).
