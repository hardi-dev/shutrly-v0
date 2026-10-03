---
name: sdv-design-feature
description: "Derive screens and UI states, iterate the design in Pencil, and record the approved reference. Explicit use only: run when the user mentions $sdv-design-feature."
---

<!-- generated from .claude/commands/sdv/design-feature.md by scripts/sdv/sync-codex-skills.py; edit the source, not this file -->

Arguments: whatever the user wrote after `$sdv-design-feature` (expected: `<feature-slug>`). Wherever the steps below say `$ARGUMENTS`, use that text.

Use the `spec-driven-vibe-coding` skill and run its **design-feature** workflow for feature: **$ARGUMENTS**

Before using Pencil MCP, open the target `.pen` file through the desktop app with `open -a Pen <absolute-path-to-file.pen>`. Use Pencil MCP for all design inspection and modification; do not use the `pen` CLI to edit design content.

1. Read the feature spec, acceptance criteria, and diagrams.
2. Build a screen / UI-state inventory (loading, empty, validation error, domain error, success, disabled, retry, as relevant).
3. If the feature uses shared tokens or components, load the `sdv-design-tokens-system` skill and validate the approved library and mapping before design work. Read `docs/design-system/token-usage.md` and follow it while designing:
   - choose tokens by meaning (G1–G8);
   - use component tokens inside components and semantic/scale tokens in layouts;
   - follow the spacing ladder, inset types and layout map (SP1–SP11).

   If the rules are still `PROPOSED`, follow them and say so in `design.md`.
4. If `docs/features/<slug>/<slug>.pen` does not exist, copy `skills/sdv-design-tokens-system/assets/templates/feature-consumer.pen`; do not ask the user to create a blank file manually.
5. Open the consumer file with `open -a Pen` and import/use `docs/design-system/design-system.lib.pen`. Imports are added through the Pen UI; MCP cannot write them. Ask the user to import the library, then confirm the import through MCP before placing instances. Build from linked library instances, variables, themes, slots, and properties; do not copy geometry or detach instances without explicit approval.
6. Design in Pencil. The approved library is the source for reusable visual values and components; `tokens.json` is the repository interchange and validation representation.
7. If the design exposes undefined behavior, report `SPEC GAP` and update the owning spec/rule before continuing.
8. Write `docs/features/<slug>/design.md`: Pencil file/frame IDs, version, state inventory, token/component dependencies, library link status, token-usage rule exceptions (with rule IDs), and approval status. Ask the user to save the `.pen` file (⌘S) and confirm the size/mtime change. Do not duplicate pixel specs in Markdown.
9. Set feature status to `DESIGNED` once the user approves.
10. Once the design is approved and the user has exported the HTML frames to `docs/features/<slug>/exports/`, run `python3 scripts/sdv/compact-exports.py <slug>`. It writes `exports/_compact/` (a stripped base per screen and device, a diff per other state, and `INDEX.md`), which `$sdv-build-feature` reads instead of the raw exports. Record the result in `design.md`. Rerun it after every re-export; `--check` exits 1 when it is out of date. Do not edit the generated files.

Finish with the completion report and recommend `$sdv-plan-feature`.
