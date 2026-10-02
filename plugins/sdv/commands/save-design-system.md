---
description: Persist an explicitly approved Pencil exploration into tokens.json, Pencil variables, a documented token canvas, and reusable library components
argument-hint: "<exploration.pen> [tokens | canvas | components]"
---

Use the `sdv-design-tokens-system` skill and run its **save-design-system** workflow for: **$ARGUMENTS**

This command requires explicit user approval of the current direction and expanded token set. If approval is absent, stop and continue exploring with `/sdv:design-system` or `/sdv:design-tokens`.

The command is re-entrant. Detect which phases are done and continue with the next pending one, or run the phase named in the arguments:

- **A — tokens:** write `tokens.json` and load the Pencil variables.
- **B — canvas:** build or refresh the token canvas, boards 00–06.
- **C — components:** build the reusable components. This phase requires rules approved through `/sdv:design-rules`.

Guardrails for every phase:

- Open each `.pen` file with `open -a Pen <absolute-path>` before using Pencil MCP, and pass `filePath` on every `execute` call.
- Use Pencil MCP for all design inspection and modification. Never read a `.pen` file from the terminal, and never use the `pen` CLI for design content.
- Never overwrite a project file without confirmation.

## Phase A — tokens (canonical first)

1. Re-read the approved canvas: the selected direction, the OBSERVED/PROPOSED values, and the decision record, including the user's exact approval reply and the accepted gaps.
2. Write `docs/design-system/tokens.json`, starting from `skills/sdv-design-tokens-system/assets/templates/tokens.json` when none exists. Keep user-approved names. Follow this structure:
   - Primitives go under `color.primitive.*`. Alpha tints are `#RRGGBBAA` primitives such as `color.primitive.alpha.<hue>-<step>-a<pct>`.
   - Themed semantics go under `color.semantic.*`.
   - Scales go under `space.*`, `radius.*`, `opacity.*` (0–1), `elevation.N.*` and `font.*`.
   - Component contracts go under `component.*`.
   - The light value goes in `$value`; other modes go in `$extensions["dev.pen.modes"].<mode>`; the axis goes in root `$extensions["dev.pen.themes"]`.
   - Composite typography and shadow are split into scalar tokens.
3. Check component coverage against the checklist in the skill. Each component the product needs has colour, padding/gap **and** radius tokens. Snap observed legacy spacing to the approved scale, and note the original value in `$description` (for example `9 → 8`). A missing column is a `DESIGN TOKEN GAP` to resolve before continuing.
4. Validate: `python3 skills/sdv-design-tokens-system/scripts/validate_tokens.py docs/design-system/tokens.json`. Fix every error; a warning needs a reason.
5. Generate: `python3 skills/sdv-design-tokens-system/scripts/tokens_to_pencil.py docs/design-system/tokens.json`. This writes `pencil-variables.json` and `pencil-mapping.json` (preserving `library`, `library_canvas`, `components`, `components_status` and `verification`), and prints checksums. Re-run the validator with `--mapping` and `--payload`.
6. Ensure `docs/design-system/design-system.lib.pen` exists. If it does not, copy `assets/templates/design-system-library.lib.pen` there (the Forma DEMO token canvas) and read the library identity rule in `references/pen-dev-mapping.md`. Record the file's size and mtime.
7. Load the variables in the open library:
   - If the payload removes names that the library uses (the first persistence over the demo template always does), run refresh pass R0 from `references/pencil-canvas-builders.md` first.
   - Then call `SetVariables(payload, true)`. It inlines removed variables as raw values, so rebind the nodes R0 listed.
   - Report live variables that are not in `tokens.json` as drift before replacing them.
8. Checksum: run the JS snippet in `references/pen-dev-mapping.md`. The total must equal the one `tokens_to_pencil.py` printed. On a mismatch, compare group checksums, fix the cause, and re-run.

## Phase B — token canvas (boards 00–06)

9. Refresh the canvas with `references/pencil-canvas-builders.md`:
   - rebuild 01 and 06 in `tokens.json` order;
   - prune, add and refresh the rows on 02, with contrast badges;
   - regenerate the static labels on 00, 03, 04 and 05 (token counts, hex, `px`, radius and opacity labels, shadow values);
   - replace the Forma demo copy with product copy;
   - change the cover's `DEMO ONLY` chip to `PERSISTED <date>` only after step 11 passes.
10. Check the canvas in separate `execute` calls: the canvas scan (0 broken refs; no raw colours outside the allowlist; no unexpected layout problems) and screenshots of every board, including the dark previews on 02, 05 and 06. Fix issues by updating nodes in place, never by deleting and redrawing.
11. **Disk-save gate.** Ask the user to press ⌘S in Pen, then re-check the library's size and mtime. If they are unchanged, or the file is still a template stub, the library is not persisted: say so, and do not write `PERSISTED`.
12. Update the exploration decision record (board 03) with `PERSISTED <date>`, what was built (tokens, canvas boards, counts, checksum) and what was not (rules, components, consumers). Ask the user to save `exploration.pen` too.

Finish phases A and B with the completion report (see below), then recommend `/sdv:design-rules`.

## Phase C — components (after `/sdv:design-rules` approval)

13. Confirm that `token-usage.md` is `APPROVED`. If it is not, stop and recommend `/sdv:design-rules`.
14. For each component the product needs, build a reusable (`reusable: true`) component in the library:
    - Bind colour, padding/gap and radius to its `component/*` variables. Width and height stay literal or `fit_content`.
    - Use variants for state, size and intent; properties for text and visibility; slots for replaceable content.
    - Follow `token-usage.md` (G3, SP5, SP6, §4.2 inset types).
    - Put components at the top of the canvas, not inside the documentation boards.
15. Document each component in `docs/design-system/components/<name>.md` from `assets/templates/component-spec.md`: node ID, properties, states, token dependencies and cited rules.
16. Index the components on board 06 (a Components section) or a new board, and in `pencil-mapping.json › components`. Set `components_status`.
17. Check the components' light and dark instances, run the canvas scan, pass the disk-save gate, and ask the user to save.

## Completion report

Report exactly what was persisted:

- file paths and disk evidence;
- token counts;
- checksum;
- boards built or refreshed;
- the rules status;
- the components status;
- every `DESIGN TOKEN GAP`, `CONFLICT`, broken-library-link or unsupported composite (with its split tokens).

Never claim the library is linked or importable until a consumer imports it through the Pen UI. Recommend `/sdv:design-rules` after phase B, and `/sdv:verify-design-system` after phase C (or after B when components are deferred).
