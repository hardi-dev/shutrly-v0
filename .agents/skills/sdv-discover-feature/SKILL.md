---
name: sdv-discover-feature
description: "Specify one feature — spec, business-rule refs, acceptance criteria, open questions. Explicit use only: run when the user mentions $sdv-discover-feature."
---

<!-- generated from .claude/commands/sdv/discover-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-discover-feature` (expected: `<feature-slug>`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **discover-feature** workflow for feature: **$ARGUMENTS**

If no slug was given, propose the next feature from `docs/product/feature-map.md` and ask before continuing.

1. Load only relevant context: `docs/features/<slug>/intent.md` if it exists, feature-map entry, related journeys, related `BR-*` rules, constitution, relevant ADRs. Do not read the whole docs tree.
   - If an intent exists and is not `ACCEPTED`, stop and ask the Owner to accept it (or run `$sdv-capture-intent <slug>`). Do not specify against a draft.
   - Carry the intent's open questions into the spec; answer them or keep them open. Keep the spec within the intent's constraints and out-of-scope list, and report any widening as a `SPEC GAP`.
   - No intent file is fine for small or pre-existing features; proceed as before.
2. Resolve `SPEC GAP`s already recorded against this feature's rules. Ask focused questions only where the answer changes behavior; label low-risk reversible assumptions explicitly.
3. Write `docs/features/<slug>/spec.md`: status, goal, user story, preconditions, inputs, main / alternative / error flows, business-rule references (reference IDs, do not duplicate rules), dependencies, out of scope, open questions.
   - Fill **Flagged Concerns**: check the spec against the constitution, the referenced `BR-*` rules, relevant ADRs and coding rules. List every point you cannot satisfy, or where two sources contradict, as `FC-NNN` with the sources, `OPEN`. Do not quietly pick a side and do not edit a higher-authority document. Write `None` only after checking.
4. Write `docs/features/<slug>/acceptance-criteria.md` with stable `AC-<AREA>-NNN` IDs in Given/When/Then form, each listing the `BR-*` it covers.
5. If discovery changes a business rule or scope, update the owning artifact (`docs/domain/` or `docs/product/`) first — never only the feature spec.
6. Present the flagged concerns to the Owner first and record each decision in the table (`RESOLVED`). Set the feature's status in `feature-map.md` to `SPECIFIED`, or `DISCOVERY` if any concern is `OPEN` or gaps remain.

Finish with the completion report and recommend `$sdv-model-feature` or `$sdv-design-feature`.
