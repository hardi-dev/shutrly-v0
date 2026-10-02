# Changelog

## 1.4.1 — 2026-09-26

- Updated plugin version metadata to `1.4.1`.
- Prepared the Codex plugin package and release archive.

## 1.4.0 — 2026-09-26
Lessons from a real project run (Shutrly, 2026-09-26) folded into `sdv-design-tokens-system`.

**Library template and token canvas**
- `design-system-library.lib.pen` is no longer an empty stub. It is now a documented token-canvas template: boards 00–08 (cover, primitives, semantic with light/dark previews and contrast badges, typography, spacing/radius/opacity, elevation, component tokens, usage rules, spacing rules).
- The template carries a neutral Forma DEMO token set of 235 variables. It exercises every layer: primitives including alpha, themed semantics, and component tokens with padding, gap and radius. The cover is marked `DEMO ONLY — replace on persistence`.
- New `references/pencil-canvas-builders.md` holds the generalized `execute` builders and refresh passes. The passes cover removed-variable rebinding, rebuilding 01/06, the 02 row refresh with contrast, static-label regeneration, and clone-and-rebind rows.
- Documented the library identity (`fileToken`) rule and the fact that consumer imports are added through the Pen UI.

**Persistence pipeline**
- `tokens.json` is canonical. New `scripts/tokens_to_pencil.py` emits the Pencil `SetVariables` payload, `pencil-mapping.json` (variables, counts, themes, transforms, unsupported, checksum; hand-maintained keys are preserved) and FNV-1a checksums per group and in total. Verified against the project: the generated payload equals the project payload exactly, with checksum `37f6438f`.
- Mode representation: light is in `$value`, other modes are in `$extensions["dev.pen.modes"]`, and the axis is in root `$extensions["dev.pen.themes"]`. The `tokens.json`, `pencil-mapping.json` and new `pencil-variables.json` templates follow it.
- `pen-dev-mapping.md` records the Pencil representation rules:
  - opacity variables are percent;
  - width/height cannot bind;
  - composite typography and shadow are split into scalar tokens;
  - dark tints use alpha primitives;
  - `SetVariables` merges, while a replace inlines removed variables as raw values.

  It also adds the JS checksum snippet, the library canvas scan and the disk-save gate. Pen does not autosave; nothing is `PERSISTED` until the file's size/mtime changes after the user saves.
- `/sdv:save-design-system` is now re-entrant, with phases A (tokens), B (token canvas) and C (components). It adds a component coverage checklist (colour + padding/gap + radius), updates the exploration decision record, and applies the disk-save gate.

**Validation and verification**
- `validate_tokens.py` now checks:
  - hex format (`#RGB`/`#RRGGBB`/`#RRGGBBAA`);
  - alias cycles;
  - mode values (declared, typed, resolvable);
  - layer rules (semantic → primitive only; component → semantic/scale only; no raw component values);
  - optionally `--mapping` and `--payload` equality.
- `/sdv:verify-design-system` adds the live checksum; a canvas scan (broken refs, raw colours with an allowlist, layout problems ignoring intentional clipping); the disk-save check; rules, component and consumer checks ("no consumers" is N/A, never "linked"); and light/dark preview checks.
- New `assets/templates/verification-report.md`.

**Usage rules**
- New `assets/templates/token-usage.md`: G1–G8 with a decision path, colour role tables, type styles, spacing SP1–SP11 with inset/stack/inline ladders and a layout map, radius, elevation, opacity, accessibility, branding, and the research basis.
- New `/sdv:design-rules` command: a research pass, then `token-usage.md` and boards 07/08 as `PROPOSED`, then explicit approval to `APPROVED`. `/sdv:design-feature` and `/sdv:verify-feature` now follow and check the rules.

**Exploration**
- `/sdv:design-system` adds:
  - a legacy-designs path (extract to scratch, user copies frames, frame IDs as evidence);
  - observed-value frequency extraction with `CONFLICT`s;
  - a true-scale representative case;
  - additional studies, with every follow-up decision recorded;
  - contrast-driven recommendations and accepted gaps;
  - the stale-`problems` re-scan.

**Housekeeping**
- README, `/sdv:help` and `component-spec.md` are updated.

## 1.3.6 — 2026-09-26
- Designed the exploration template as three bounded boards covering visual directions, token expansion and primitive studies, and a representative case with a decision record.
- Aligned `/sdv:design-system` and `/sdv:design-tokens` with the exploration sections, evidence provenance, visual verification, and explicit approval scope.
- Kept the library and feature-consumer templates blank pending their separate design work.

## 1.3.5 — 2026-09-26
- Documented opening `.pen` files with `open -a Pen` before using Pencil MCP.
- Explicitly prohibited using the `pen` CLI for design edits in the skill and design commands.

## 1.3.4 — 2026-09-26
- Added populated Pencil templates for exploration, the approved design library, and feature consumer files.
- Updated commands and skill guidance so projects copy bundled `.pen` templates instead of creating them manually.

## 1.3.3 — 2026-09-26
- Updated the design workflow to separate provisional exploration files, approved Pencil `.lib.pen` libraries, and feature consumer files.
- Documented observed/proposed/approved/persisted token states and linked library-instance rules.
- Expanded `/sdv:help` with the Pencil-first design-system lifecycle.
- Added bundled Pencil templates for exploration, the design library, and feature consumers.

## 1.3.2 — 2026-09-25
- Added `assets/templates/component-spec.md` for documenting reusable component anatomy, variants, states, slots, tokens, accessibility, and usage guidance.

## 1.3.1 — 2026-09-25
- Added `/sdv:help` as a read-only, project-aware guide to the complete SDV and design-system workflows.

## 1.3.0 — 2026-09-25
- Changed `sdv-design-tokens-system` to a Pencil-first exploration workflow.
- Added an explicit approval gate before persisting Pencil values to variables or DTCG-compatible JSON.
- Added `/sdv:save-design-system` for approved design-system persistence.

## 1.2.0 — 2026-09-25
- Added `sdv-design-tokens-system` for DTCG-compatible tokens, themes, Pencil variables, reusable components, synchronization, and drift verification.
- Added `/sdv:design-tokens`, `/sdv:design-system`, `/sdv:sync-pencil`, and `/sdv:verify-design-system` commands.
- Integrated token/component checks into feature design and verification workflows.

## 1.1.0 — 2026-09-25
- Renamed plugin to `sdv` so commands are namespaced (`/sdv:*`) and don't collide with other skills/plugins.
- Added `commands/` with 8 workflow commands: init-project, discover-feature, model-feature, design-feature, plan-feature, build-feature, verify-feature, ship.
- SKILL.md: modes table now lists the real command names; the agent must recommend `/sdv:*` names instead of bare pseudo-commands.

## 1.0.0
- Initial skill, templates, hotel-booking example, workflow reference, bootstrap script.
