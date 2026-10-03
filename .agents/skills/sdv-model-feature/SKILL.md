---
name: sdv-model-feature
description: "Create activity / sequence / state diagrams for a feature — only where they reduce ambiguity. Explicit use only: run when the user mentions $sdv-model-feature."
---

<!-- generated from .claude/commands/sdv/model-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-model-feature` (expected: `<feature-slug>`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **model-feature** workflow for feature: **$ARGUMENTS**

1. Read the feature `spec.md`, `acceptance-criteria.md`, and referenced `BR-*` rules.
2. Create diagrams in `docs/features/<slug>/diagrams/` using Mermaid, only when useful:
   - `activity.md` — when the process has branching or ambiguity.
   - `sequence.md` — when interaction order between actors/services matters.
   - `state.md` — when an entity lifecycle transitions.
3. State for each diagram skipped why it isn't needed.
4. Report any behavior the diagrams expose that the spec doesn't define as `SPEC GAP`, and update the spec before continuing.

Finish with the completion report and recommend `$sdv-design-feature`.
