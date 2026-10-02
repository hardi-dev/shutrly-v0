---
description: Synchronize approved repository design tokens with Pencil through MCP
argument-hint: "<pencil-file> [token-path]"
---

Use the `sdv-design-tokens-system` skill and run its **sync-pencil** workflow for: **$ARGUMENTS**

Guardrails:

- Open the target file with `open -a Pen <absolute-path-to-file.pen>` before using Pencil MCP, and pass `filePath` on every `execute` call.
- Use Pencil MCP for all design inspection and modification. Never read a `.pen` file from the terminal, and never use the `pen` CLI for design content.

1. Confirm that `tokens.json` represents an explicitly approved design direction. If it does not exist yet, recommend `/sdv:design-system` followed by `/sdv:save-design-system`.
2. Validate `tokens.json`, then regenerate the payload and mapping with `tokens_to_pencil.py`. Validate again with `--mapping` and `--payload`. `tokens.json` is the only place token values are edited.
3. Compare the live library variables with the payload: checksum per group, plus live-only and payload-only names. Report live-only variables as drift. Do not promote them into `tokens.json` without a `DESIGN TOKEN GAP` finding and the user's approval.
4. Apply the payload:
   - Additions and value changes: `SetVariables(payload)` merges.
   - Removals or renames: run refresh pass R0 from `references/pencil-canvas-builders.md`, then call `SetVariables(payload, true)` and rebind the nodes that were bound to removed variables. Replacing inlines those variables as raw values.
5. Re-run the checksum. The totals must match.
6. Refresh the token canvas's static labels, and any rows or components affected by added or removed tokens. Run the canvas scan, then screenshot the changed boards in both modes.
7. Reopen or refresh the affected consumer files. Inspect variables, themes, linked component instances, slots and properties.
8. Disk-save gate: ask the user to press ⌘S in every edited file, then confirm the size/mtime change.
9. Write or update a sync report: source revision, checksums before and after, library source, consumer files, changes, rebinds, unresolved drift and preview results.

Finish with the completion report and recommend `/sdv:verify-design-system`.
