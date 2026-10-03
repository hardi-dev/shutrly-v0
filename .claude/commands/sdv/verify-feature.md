---
description: Cross-check a feature's implementation against constitution, rules, spec, UML, and Pencil design
argument-hint: "<feature-slug>"
model: claude-opus-5-5
effort: high
context: fork
agent: general-purpose
background: false
---

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

Finish with the completion report and recommend fixes or `/sdv:ship`. If the feature is now `DONE`, also recommend `/sdv:handoff`.
