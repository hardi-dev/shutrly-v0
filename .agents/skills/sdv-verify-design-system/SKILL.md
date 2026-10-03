---
name: sdv-verify-design-system
description: "Verify token structure, Pencil mappings, themes, library canvas, rules, components, consumers, and visual design-system drift. Explicit use only: run when the user mentions $sdv-verify-design-system."
---

<!-- generated from .claude/commands/sdv/verify-design-system.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-verify-design-system` (expected: `[design-system.lib.pen] [tokens.json]`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `sdv-design-tokens-system` skill and run its **verify-design-system** workflow for: **$ARGUMENTS**

Guardrails:

- Open every `.pen` file you inspect with `open -a Pen <absolute-path>` before using Pencil MCP, and pass `filePath` on every `execute` call.
- Use Pencil MCP for all design inspection. Never read a `.pen` file from the terminal, and never use the `pen` CLI for design content.
- Verification is read-only unless the user asks for fixes.

Write `docs/design-system/verification-report.md` from `skills/sdv-design-tokens-system/assets/templates/verification-report.md`. Every check gets `PASS`, `FAIL` or `N/A` plus concrete evidence.

1. **Token files.** Run:

   ```bash
   python3 skills/sdv-design-tokens-system/scripts/validate_tokens.py docs/design-system/tokens.json --mapping docs/design-system/pencil-mapping.json --payload docs/design-system/pencil-variables.json
   ```

   This covers:
   - types and hex format (`#RGB`, `#RRGGBB`, `#RRGGBBAA`);
   - aliases and cycles;
   - mode values in `$extensions["dev.pen.modes"]` (declared, typed, resolvable);
   - layer rules (semantic → primitive only; component → semantic/scale only; no raw component values);
   - duplicate normalized names;
   - mapping coverage and counts;
   - payload equality.

   If the payload is missing, regenerate it with `tokens_to_pencil.py --dry-run`, and report the missing file.
2. **Checksum.** Compute the FNV-1a checksum of the live library variables with the `execute` snippet in `references/pen-dev-mapping.md`, and compare it with `tokens_to_pencil.py --dry-run` (total and per group). Also list live variables that are not in the payload, and payload variables missing from the library. Both are drift.
3. **Theme axis and coverage.** Check the declared axis and default, the count of themed tokens, and confirm that the remaining tokens are mode-invariant by design.
4. **Library canvas scan.** Run the scan in `references/pen-dev-mapping.md`, in separate `execute` calls from any edit:
   - Broken `$` references must be 0.
   - Hard-coded colours must sit on the documentation allowlist: backdrops `#FFFFFF`/`#18181B`/`#E4E4E7`, redline `#E5487F`/`#E5487F2E`, and deliberate Don't examples. Anything else is a finding.
   - Layout `problems` count only if unexpected. Ignore intentional clipping inside `clip: true` frames (opacity tints, toast accent bars), and re-run once before reporting, because `problems` can be stale.
   - Spot-check that the static labels (hex, contrast, counts, `px`) match the variables.
5. **Light/dark previews.** Count the theme-scoped frames per mode, and screenshot 02, 05, 06 and at least one component in dark mode. Check that dark values resolve and that contrast badges agree with the current tokens.
6. **Disk-save check.** Check the size and mtime of `design-system.lib.pen` and `exploration.pen`. A template-stub size, or an mtime older than the last reported persistence, means that MCP edits were not saved. That is a blocking finding; ask the user to press ⌘S.
7. **Usage rules.** `token-usage.md` exists, its status is recorded, boards 07/08 match it, and every token it names exists. `PROPOSED` rules are reported as not yet a verification baseline.
8. **Components.** Record the reusable component count and instance count. Check each component's coverage (colour, padding/gap, radius bound to `component/*`), its spec file, and its `pencil-mapping.json › components` entry. Zero components after rules approval is blocking.
9. **Consumers.** Find `docs/features/**/*.pen`. With none, report `N/A — no consumers exist; library import unproven`, never "linked". For each consumer:
   - open it;
   - confirm that it imports the library (imports are added through the Pen UI);
   - confirm that it uses linked instances rather than copied geometry;
   - check overrides, slots and themes;
   - check compliance with `token-usage.md`.
10. **Exploration isolation.** The exploration file holds no library variables or components and is not a consumer. Its decision record matches the persisted state.
11. **Classify every deviation:**
    - blocking vs non-blocking;
    - `CONFLICT` / normalization drift (exploration vs persisted);
    - `DESIGN TOKEN GAP` (including accepted gaps, quoting the user's decision);
    - Pencil representation notes (opacity percent transform, size binding, composite splits);
    - broken-library-link.

Mark verification complete only when no blocking finding remains. Do not mark it complete while the library's disk state or import/link status is unknown. Otherwise, finish with the smallest corrective workflow (for example "⌘S in Pen", "`$sdv-save-design-system components`", "`$sdv-design-rules` approval", "`$sdv-sync-pencil`") and recommend re-running this command.
