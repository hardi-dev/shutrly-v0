---
name: sdv-design-tokens-system
description: Use when shaping visual foundations, themes, reusable components, or checking design-system drift in Pencil and repository token artifacts.
---

# SDV Design Tokens & Design System

Use this skill to help the user do three things:

- Discover a visual language on the pen.dev canvas.
- Expand the observed values into a coherent token system.
- Persist the approved result, then verify its consumers.

Persisting produces DTCG `tokens.json`, Pencil variables, a documented token canvas, token-usage rules, and reusable library components.

`tokens.json` is the canonical token source. The Pencil variables, `pencil-mapping.json` and the Pencil payload are derived from it. The approved `.lib.pen` file is the Pencil source for reusable variables, documentation boards and components. The exploration canvas is provisional.

## Relationship to SDV

Keep product intent, domain rules, feature behaviour and technical design in `spec-driven-vibe-coding`. Use this skill for visual foundations and reusable UI assets.

- `/sdv:design-feature` loads this skill when a feature uses shared tokens or components. Designs follow `docs/design-system/token-usage.md`.
- `/sdv:verify-feature` loads this skill when visual verification includes token or component alignment. It checks compliance with `token-usage.md`.
- `/sdv:design-system` explores directions. `/sdv:design-tokens` handles token architecture.
- `/sdv:save-design-system` crosses the approval boundary: it persists the tokens and token canvas, and later builds the components.
- `/sdv:design-rules` writes and approves the usage and spacing rules (boards 07/08).
- `/sdv:sync-pencil` synchronizes later token changes. `/sdv:verify-design-system` checks for drift.

## Artifacts

| Artifact | Role | Created from |
|---|---|---|
| `docs/design-system/exploration.pen` | Provisional directions, OBSERVED/PROPOSED studies, representative case, decision record | `assets/templates/design-system-exploration.pen` |
| `docs/design-system/tokens.json` | **Canonical** DTCG tokens: light in `$value`, other modes in `$extensions["dev.pen.modes"]`, theme axis in root `$extensions["dev.pen.themes"]` | `assets/templates/tokens.json` (Forma demo shape) |
| `docs/design-system/pencil-variables.json` | Pencil `SetVariables` payload (generated) | `scripts/tokens_to_pencil.py` |
| `docs/design-system/pencil-mapping.json` | Token ⇄ variable map, counts, themes, transforms, unsupported, checksum, library canvas, components (generated + preserved keys) | `scripts/tokens_to_pencil.py`, `assets/templates/pencil-mapping.json` |
| `docs/design-system/design-system.lib.pen` | Library: variables, token canvas boards 00–08, reusable components | `assets/templates/design-system-library.lib.pen` (Forma DEMO canvas) |
| `docs/design-system/token-usage.md` | Usage and spacing rules (G1–G8, SP1–SP11); `PROPOSED` → `APPROVED` | `assets/templates/token-usage.md` |
| `docs/design-system/components/<name>.md` | One spec per library component | `assets/templates/component-spec.md` |
| `docs/design-system/verification-report.md` | Verify evidence | `assets/templates/verification-report.md` |
| `docs/features/<slug>/<slug>.pen` | Consumer that imports the library | `assets/templates/feature-consumer.pen` |

Copy templates only when the target does not exist. Never overwrite a project file without confirmation. The bundled library template is a clearly labelled `DEMO ONLY` Forma canvas: its variables, labels and sample copy are replaced on persistence and must never be treated as project evidence.

Scripts, run from the project root:

- `scripts/validate_tokens.py tokens.json [--mapping pencil-mapping.json] [--payload pencil-variables.json]` checks types, hex format, aliases, cycles, mode values and layer rules, and optionally compares the mapping and payload.
- `scripts/tokens_to_pencil.py tokens.json` writes the payload and the mapping, and prints FNV-1a checksums per group and in total.

References:

- [references/token-architecture.md](references/token-architecture.md): layers, naming, modes, governance.
- [references/pen-dev-mapping.md](references/pen-dev-mapping.md): Pencil representation rules, checksum snippet, canvas scan, disk-save gate, library identity.
- [references/pencil-canvas-builders.md](references/pencil-canvas-builders.md): `execute` builders and refresh passes for boards 00–08.

## Lifecycle

1. **Explore** (`/sdv:design-system`). Gather preferences, explore directions or ingest legacy designs, and record the user's selection.
2. **Expand tokens** (`/sdv:design-tokens`). Take `OBSERVED` values from the selected frames, expand them into `PROPOSED` scales, and surface `CONFLICT`s and `DESIGN TOKEN GAP`s.
3. **Approve.** The user explicitly approves the direction and the expanded token set (the approval gate below).
4. **Persist tokens** (`/sdv:save-design-system`, phase A):
   - Write `tokens.json`, then validate it.
   - Run `tokens_to_pencil.py`, then call `SetVariables` on the library.
   - Check that the Pencil checksum equals the repository checksum.
5. **Token canvas** (`/sdv:save-design-system`, phase B). Build or refresh boards 00–06 and regenerate every static label.
6. **Disk-save gate.** The user saves the library in Pen (⌘S). Confirm the size and mtime on disk before anything is reported `PERSISTED`.
7. **Usage and spacing rules** (`/sdv:design-rules`):
   - Do a short research pass and cite its sources.
   - Generate `token-usage.md` and boards 07/08 as `PROPOSED`.
   - Mark them `APPROVED <date>` only after explicit user approval.
8. **Components** (`/sdv:save-design-system`, phase C, after the rules are approved):
   - Build reusable components bound to `component/*` variables for colour, padding/gap and radius.
   - Write one component spec per component.
   - Index the components on board 06 and in `pencil-mapping.json › components`.
9. **Verify** (`/sdv:verify-design-system`). Run the validator, the checksum, the canvas scan, the disk-save check, component and consumer checks, and the light/dark previews.
10. **Consume** (`/sdv:design-feature`). Feature files import the library and use linked instances. They follow `token-usage.md`.

## Token decision statuses

Use these consistently in the canvas, reports and mappings:

- `PROVISIONAL`: active exploration values.
- `OBSERVED`: values evidenced on the canvas, with the source frame IDs.
- `PROPOSED`: systematic expansions.
- `UNOBSERVED`: required but not evidenced.
- `APPROVED`: explicitly accepted by the user; quote the reply.
- `PERSISTED`: written to the repository and saved in the library on disk.

Usage rules use the same `PROPOSED` → `APPROVED` gate as tokens.

## Pencil access

Before using Pencil MCP on a file, open it through the desktop app:

```bash
open -a Pen <absolute-path-to-file.pen>
```

- Use Pencil MCP for all design inspection and modification, and pass an explicit `filePath` whenever more than one document is open. The active editor may be a different project.
- Never `Read`, `cat` or `grep` a `.pen` file, and never write one with a text editor.
- Do not use the `pen` CLI for design content.
- Terminal commands are limited to: opening Pen; copying templates or extracting archives into a scratch directory; running the token scripts; checking file size/mtime; validation and packaging.
- MCP edits live in the open document until the user presses ⌘S; Pen does not autosave. Imports into consumer files are added through the Pen UI; MCP cannot write `imports`.

## Approval gate

Before explicit approval, the agent must not:

- Write or overwrite canonical token JSON.
- Claim that the token system is finalized.
- Replace existing shared Pencil variables.
- Create or update the approved `.lib.pen` source library.
- Sync values to CSS or application code.
- Mark usage rules `APPROVED`.

Accept approval only when the user clearly says that the direction and expanded token set, or the rules, are approved or should be saved. Record the user's exact reply in the decision record. If the user asks for more exploration, continue on the canvas. Existing token files or a `.lib.pen` library are constraints and references during exploration; do not change them until approval.

## Exploration lessons

- **Legacy designs.** If the user rejects the generated directions and points to earlier designs (for example a zip of `.pen` files):
  - Extract to a scratch directory and never modify the original.
  - Open the files in Pen and inspect them through MCP.
  - Ask the user to copy the chosen frames into `exploration.pen`. A cross-file copy through MCP round-trips large JSON through context.
  - Record the user's canvas selection as the chosen direction and the legacy frame IDs as evidence.
- **Observed-value extraction.** Collect frequency statistics over the selected frames: fills, strokes, radii, gaps, paddings, font sizes and weights. These become `OBSERVED`. Surface mixed palettes (for example zinc vs slate), duplicate brand colours and off-grid values as `CONFLICT`s with a recommendation. Fold them only on an explicit user decision.
- **Representative case.** Build it at true scale from the user's picks. Do not scale it down or reinterpret it. When a component differs from its source frame, fix it back to the source structure.
- **Follow-up studies.** Allow extra studies on board 02 (feedback/toast variants, form elements, border options). Record every follow-up decision, with the user's exact reply, in the decision record.
- **Contrast arithmetic** drives recommendations (for example white on candidate action colours). Record accepted exceptions, such as an input border below 3:1, as accepted gaps with mitigations.
- **Stale `problems`.** Right after a large insert, `problems` from `Get` can be stale. Re-run the scan in a separate `execute` before fixing anything.

## Token architecture

- **Primitive tokens:** the raw palette (including `#RRGGBBAA` alpha primitives), type scale, spacing, radius, opacity and elevation values.
- **Semantic tokens:** purpose-based aliases of primitives, themed per mode (`color.semantic.text.primary`).
- **Component tokens:** component contracts under `component.*` that alias semantic or scale tokens. Each component covers colour, padding/gap and radius.

Use modes for context changes. Never encode a mode in a token name. Composite typography and shadow are split into scalar tokens. See [references/token-architecture.md](references/token-architecture.md).

### Component token coverage checklist

For each component the product needs, confirm that colour, padding/gap and radius are all tokenized. The Forma template covers all twelve:

| Component | Colour | Padding / gap | Radius |
|---|---|---|---|
| button | primary/secondary background, text, border, hover | `md.padding-x/y`, `gap` | `radius` |
| nav | item background-active, text, text-active, icon; count background/text | `item.padding-x/y`, `item.gap` | `item.radius` |
| chip | status.<s>.background / text | `padding-x/y`, `gap` | `radius` |
| metric | tile background/border, delta, spark | `tile.padding`, `tile.gap`, `delta.padding-x/y` | `tile.radius`, `delta.radius` |
| calendar | day background(-selected), label/number-selected | `day.padding-y`, `day.gap` | `day.radius` |
| toast | background, border, title, body, icon.<s> | `padding-x/y`, `gap`, `text-gap` | `radius` |
| input | background(-disabled), border(-focus/-error), text, placeholder, label, helper, error-text | `padding-x`, `gap` | `radius` |
| checkbox | border, background-checked, mark | `gap` | `radius` |
| switch | track-on, track-off, knob | documented size | documented (pill) |
| segmented | track, item background-active, text, text-active | `padding`, `gap`, `item.padding-x/y` | `radius` |
| table | header background/text, row border | `row.padding-x/y`, `cell.gap` | — (inherits panel) |
| panel | app background, border | `app.header.padding-x`, `app.content.padding-x/y`, `app.content.gap` | `app.radius` |

A missing column is a `DESIGN TOKEN GAP` that blocks the components phase for that component.

## Token usage rules

`docs/design-system/token-usage.md` is a first-class artifact. Agents must follow it when:

- designing features (`/sdv:design-feature`);
- building library components (save-design-system phase C);
- building code (`/sdv:build-feature`);
- verifying (`/sdv:verify-feature`, `/sdv:verify-design-system`).

Cite rule IDs (G1–G8, SP1–SP11) in findings. While the rules are `PROPOSED`, they guide the work but are not yet a verification baseline; report them as such.

Before writing rules or a token canvas for a new project, do a short research pass (for example Atlassian, Primer, Carbon, Polaris, EightShapes) and cite the sources in the report and the file footer.

## Figma-informed practices

- Model Figma Variables concepts (collections, aliases and modes) even when the target is pen.dev.
- Use variables for single values and modes. Use split scalar tokens, or component definitions, for composite typography and effects.
- Document variables and components with purpose, usage, accessibility and replacement guidance.
- Prefer component properties and variants for meaningful state, size or content differences.
- Treat library publication and versioning as an explicit release decision.
- Keep the `.lib.pen` file and its consumers together, or record a relocatable path. Verify and repair missing-library links after moving a project.
- Copying a component origin without importing its library creates an independent copy. Prefer imported library instances.

## Required reporting

For planning, sync or verification, report only the relevant items:

- Scope completed.
- Exploration, token and rules status: provisional, approved or persisted.
- Canonical artifacts and Pencil files changed, with the disk-save evidence (size/mtime).
- Library source and consumer files checked. "No consumers" is reported as not applicable, never as linked.
- Validation, checksum, canvas-scan and preview results.
- `DESIGN TOKEN GAP`, `CONFLICT`, drift or broken-library-link findings.
- Research sources, when rules or canvas conventions were written.
- The next recommended `/sdv:` command.
