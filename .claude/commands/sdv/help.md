---
description: Explain the complete SDV workflow and recommend the next command
argument-hint: "[project, feature, or question]"
model: claude-sonnet-5-5
effort: low
---

Use the `spec-driven-vibe-coding` skill together with `sdv-design-tokens-system` when the request involves visual foundations or design tokens. Run the **help** workflow for: **$ARGUMENTS**

Give the user a concise, project-aware guide from discovery to shipping. Inspect the repository and existing `docs/` artifacts first, then:

1. Explain the overall lifecycle:

   `/sdv:init-project` → `/sdv:capture-intent` → `/sdv:discover-feature` → `/sdv:model-feature` → `/sdv:design-feature` → `/sdv:plan-feature` → `/sdv:build-feature` → `/sdv:verify-feature` → `/sdv:ship`

   Then explain what each feature stage reads and writes, and the gates between them:

   - `/sdv:capture-intent` writes `docs/features/<slug>/intent.md` (problem, outcome, constraints, open questions). Optional for small features. Only the Owner sets it to `ACCEPTED`.
   - `/sdv:discover-feature` reads an accepted intent and writes `spec.md` with a **Flagged Concerns** table, plus `acceptance-criteria.md`. It stops on a draft intent. The Owner resolves each `OPEN` concern before the feature counts as `SPECIFIED`.
   - `/sdv:plan-feature` stops while any Flagged Concern is `OPEN`.
   - `/sdv:build-feature` ends with a verify-and-fix loop (typecheck, lint, tests, e2e or screenshot diff, build as applicable) and never reports done with a failing or unrun check.
   - In Claude Code, hooks in `.claude/hooks/guard.py` enforce the `AGENTS.md` hard stops regardless of the command (Codex does not run them, so follow the stops yourself): no direct `.pen` access, no committing `.dev.vars` or `.env*`, no production migrations. A blocked action explains itself; ask the Owner rather than working around it.

2. Explain the design-system branch when visual tokens or reusable components are needed:

   1. `/sdv:design-system`: copy the bundled `.pen` templates into `docs/`, explore directions or ingest legacy designs, and select a direction.
   2. `/sdv:design-tokens`: capture `OBSERVED` tokens, expand the `PROPOSED` scales, and resolve `CONFLICT`s.
   3. The user explicitly approves the direction and the token set.
   4. `/sdv:save-design-system`, phase A (**persist tokens**): `tokens.json`, then `tokens_to_pencil.py`, then Pencil variables. The checksum must match.
   5. `/sdv:save-design-system`, phase B (**token canvas**): boards 00–06 in `design-system.lib.pen`. The user saves (⌘S) and the size/mtime change is confirmed.
   6. `/sdv:design-rules` (**usage and spacing rules**): a research pass, `token-usage.md`, and boards 07/08 as `PROPOSED`.
   7. The user explicitly **approves the rules**, which become `APPROVED`.
   8. `/sdv:save-design-system components` (**build components**): reusable components bound to `component/*` for colour, padding/gap and radius, plus component specs.
   9. `/sdv:verify-design-system` (**verify**): validator, checksum, canvas scan, disk-save check, components, consumers, light/dark.
   10. Feature `.pen` consumers import the library through the Pen UI. Use `/sdv:sync-pencil` for later token changes.

3. Explain the Pencil and repository artifact roles:

   - `exploration.pen`: provisional exploration, observed/base tokens, expanded proposals, studies, and a decision record with the user's exact replies.
   - `tokens.json`: the **canonical** token source. Light is in `$value`; other modes are in `$extensions["dev.pen.modes"]`.
   - `pencil-variables.json` and `pencil-mapping.json`: generated from `tokens.json`; never hand-edited.
   - `design-system.lib.pen`: Pencil variables, the documented token canvas (boards 00–08) and reusable components.
   - `token-usage.md`: rules for which token to use, and when (G1–G8, SP1–SP11). Followed by feature design and verification.
   - Feature `.pen` files: consumers that import the library and use linked instances rather than copied geometry.

   Bundled templates, in `skills/sdv-design-tokens-system/assets/templates/`:

   - `design-system-exploration.pen`: Forma demo exploration.
   - `design-system-library.lib.pen`: Forma DEMO token canvas, boards 00–08.
   - `feature-consumer.pen`: blank consumer.
   - `tokens.json`, `pencil-mapping.json`, `pencil-variables.json`: Forma demo token contract.
   - `token-usage.md`, `component-spec.md`, `verification-report.md`.

   Scripts, in `skills/sdv-design-tokens-system/scripts/`:

   - `validate_tokens.py`: types, hex, aliases, modes, layers, mapping and payload.
   - `tokens_to_pencil.py`: payload, mapping and checksums.

4. Explain the approval gates:
   - `/sdv:design-system` is exploratory and provisional. It must not persist canonical JSON, create the approved `.lib.pen` library, replace shared Pencil variables, or sync to code before explicit approval of both the direction and the expanded token set.
   - Usage rules have their own `PROPOSED` → `APPROVED` gate.
   - Nothing counts as `PERSISTED` until the user has saved the file in Pen and its size/mtime change has been confirmed.
5. Explain that observed values come from the canvas, while expanded values are systematic proposals. Mark them `OBSERVED`, `PROPOSED`, `UNOBSERVED`, `APPROVED`, or `PERSISTED`; do not invent missing values silently.
6. Identify the current project/feature status from available docs (including a feature's `intent.md` status and any `OPEN` Flagged Concerns) and recommend the smallest next command.
7. Mention relevant artifacts created by the recommended command and any unresolved `SPEC GAP`, `DESIGN TOKEN GAP`, `CONFLICT`, drift, or broken-library-link finding.

For Pencil work, always open the target file with `open -a Pen <absolute-path-to-file.pen>` before using Pencil MCP. Pencil MCP is the only design inspection/modification path; do not use the `pen` CLI to edit or synchronize design content. Terminal commands are limited to opening Pen, copying bundled templates, validation, and packaging when explicitly requested.

Do not run a mutating workflow merely because the user requested help. Guidance should be read-only unless the user separately asks to execute the recommended command.

Finish with:

- Current status
- Recommended next command
- What that command will create or change
- Any decision the user must make first
