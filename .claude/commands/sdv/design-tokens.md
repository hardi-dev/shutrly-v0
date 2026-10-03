---
description: Define or review observed, expanded, and approved DTCG-compatible design tokens and their themes
argument-hint: "[path or token scope]"
---

Use the `sdv-design-tokens-system` skill and run its **design-tokens** workflow for: **$ARGUMENTS**

Before any Pencil work, open the target file through the desktop app with `open -a Pen <absolute-path-to-file.pen>`. Use Pencil MCP for design inspection and modification; do not use the `pen` CLI for design content.

1. Inspect existing token files, CSS variables, design-system mappings, and relevant SDV docs. Treat existing approved artifacts as constraints, not as permission to overwrite them.
   For exploration work, read `01 — Context & visual directions` for the selected project direction and its evidence, `02 — Token expansion & primitive studies` for the candidate scales and aliases, and `03 — Representative case & decision record` for scope, gaps, and actual approval. Locate sections by meaning when a project has renamed them. Bundled Forma demo content is illustrative and must not be treated as approved project tokens.
2. Separate values by status: `OBSERVED` values came from the exploration canvas; `PROPOSED` values are systematic expansions; `UNOBSERVED` values are required by the scale but were not evidenced; `APPROVED` values were explicitly accepted; `PERSISTED` values were written to the library and repository.
3. Expand observed values into complete color, typography, spacing, radius, elevation, opacity, theme, and mode coverage. Do not silently invent missing values; record `DESIGN TOKEN GAP` or `CONFLICT` findings.
4. Define primitive, semantic and component layers with aliases, `$type`, descriptions, accessibility notes and theme/mode coverage. Plan the persisted shape now:
   - Semantics alias primitives only; components alias semantic or scale tokens only.
   - Dark tints are `#RRGGBBAA` alpha primitives, not opacity.
   - Composite type and shadow are split into scalar tokens.
   - Each component gets colour, padding/gap **and** radius tokens (see the coverage checklist in the skill).
   - Other modes will live in `$extensions["dev.pen.modes"]`.
   Before approval, express the candidate contract in the exploration board rather than canonical JSON: update the color/type/dimensional studies, alias relationships, theme scope, and primitive previews on Board 02. Retain source references and inferred provenance even after a proposed value is previewed. Reflect changes in Board 03's representative case, coverage, findings, and approval record. Do not silently change the selected direction on Board 01; return to exploration if it needs revision.
5. Do not write canonical JSON, update shared Pencil variables, or create/update the approved `.lib.pen` until the user explicitly approves both the visual direction and expanded token set.
6. Verify the edited sections through Pencil MCP reads and screenshots, checking clipping, layout, readable labels, and consistency between token candidates and the representative case. Keep procedural guidance out of the canvas.
7. Confirm approval covers the selected direction, expanded token set, themes/modes, accessibility assumptions, primitives, and resolution or explicit deferral of gaps/conflicts. After approval, recommend `/sdv:save-design-system` to persist the library and repository representation. Recommend `/sdv:design-system` when exploration or visual decisions are incomplete.

Finish with scope, artifacts, checks, findings, and next step.
