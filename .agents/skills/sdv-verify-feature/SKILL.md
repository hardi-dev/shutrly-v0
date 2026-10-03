---
name: sdv-verify-feature
description: "Cross-check a feature's implementation against constitution, rules, spec, UML, and Pencil design. Explicit use only: run when the user mentions $sdv-verify-feature."
---

<!-- generated from .claude/commands/sdv/verify-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-verify-feature` (expected: `<feature-slug>`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **verify-feature** workflow for feature: **$ARGUMENTS**

1. Load every artifact relevant to this feature's behavior: constitution, coding rules, referenced `BR-*`, spec, acceptance criteria, diagrams, design reference, technical design, ADRs.
2. Check functional behavior (each `AC-*` has passing evidence), technical quality (quality gate, security, consistency, isolation), and visual fidelity against Pencil.
3. If the feature uses shared design tokens or components, load the `sdv-design-tokens-system` skill and check token references, theme coverage, and component alignment. Also check compliance with `docs/design-system/token-usage.md`, citing rule IDs:
   - no primitives or hard-coded values (G2/G4);
   - fg/bg pairing (G5);
   - spacing ladder and inset types (SP1–SP11);
   - linked instances with no padding overrides (SP5).

   If the rules are only `PROPOSED`, report deviations as advisory.
4. Write `docs/features/<slug>/verification-report.md` listing pass/fail per item and every deviation explicitly, including design-system drift.
5. Set feature status to `DONE` only if nothing blocking remains.

Finish with the completion report and recommend fixes or `$sdv-ship`. If the feature is now `DONE`, also recommend `$sdv-handoff`.
