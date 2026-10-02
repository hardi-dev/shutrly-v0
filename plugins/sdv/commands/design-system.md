---
description: Explore and refine token-based design-system directions on the pen.dev canvas
argument-hint: "<pencil-file> [preferences]"
---

Use the `sdv-design-tokens-system` skill and run its **design-system exploration** workflow for: **$ARGUMENTS**

Before using Pencil MCP, open the target file through the desktop app with `open -a Pen <absolute-path-to-file.pen>`. Use Pencil MCP for all design inspection and modification; do not use the `pen` CLI to edit design content.

1. Resolve the target from the arguments, defaulting to `docs/design-system/exploration.pen`. If it does not exist, create its parent directory and copy `skills/sdv-design-tokens-system/assets/templates/design-system-exploration.pen` there, then open that copy in Pen. Preserve existing files. Never ask the user to create a blank `.pen` file manually.
2. Gather or infer user preferences, clearly labeling assumptions.
3. Use Pencil MCP to inspect the three exploration boards and adapt their content to the project. The bundled Forma content is a complete dummy example, not project requirements or an approved design. Replace its demo selection, evidence, findings, and approval record when starting a real project. Never treat template values as project evidence merely because they were copied. The `pen` CLI must not be used to inspect or modify design content.
4. Populate `01 — Context & visual directions`: product intent, personality, constraints, comparable direction studies, grouped palette/type/component samples, rationale, trade-offs and the selected direction. Use the same case and sample dimensions across alternatives. Record the user's selection separately from approval of the whole system, and do not preselect the template's Direction A for them.
   - **Legacy designs path.** If the user rejects the generated directions and points to earlier designs (for example a zip of `.pen` files):
     - Extract them into a scratch directory; never modify or move the original.
     - Open each file with `open -a Pen` and inspect it through MCP.
     - Ask the user to copy the chosen frames into `exploration.pen` themselves. A cross-file copy through MCP round-trips large JSON through context.
     - Record the user's canvas selection as the chosen direction, with the legacy file names and frame IDs as evidence.
5. Populate `02 — Token expansion & primitive studies`: capture the values of the selected direction as `OBSERVED`, with source references, then expand colour, typography, spacing, radius, elevation and opacity into `PROPOSED` scales. Show primitive → semantic → component aliases, the theme/mode scope, and local primitive/component previews. Mark unsupported requirements `UNOBSERVED` and record gaps. Showing a proposed value in a swatch does not erase its inferred provenance.
   - **Observed-value extraction.** Use a Pencil MCP visitor to count frequencies over the selected frames: fills, strokes, corner radii, gaps, paddings, font sizes and weights. Report each value with its count and source frames.
   - **Conflicts.** Surface mixed palettes (for example zinc vs slate neutrals), near-duplicate brand colours and off-grid values (3, 5, 9, 14 …) as `CONFLICT-nn`, each with a recommendation (fold, snap to the scale, or keep). Fold or snap them only on an explicit user decision.
   - **Contrast arithmetic** drives the recommendations. Compute ratios for candidate action colours (for example white on each candidate blue), text roles and control borders, and show them next to the swatches. If the user keeps a value below the target (for example an input border below 3:1), record it as an accepted `DESIGN TOKEN GAP` with its mitigations (visible label, height, 2 px focus/error borders).
   - **Additional studies.** Add studies on this board when the user asks (feedback/toast variants, form elements, border options), labelled `STUDY` with options A/B/C.
6. Populate `03 — Representative case & decision record`: apply the candidate direction to a representative screen and summarize the selection rationale, token coverage, primitives, accessibility assumptions, unresolved gaps/conflicts and approval status. The screen and component seeds remain local exploration studies, not a published library or a linked feature consumer.
   - The representative case is **true scale** and built from the user's picks, not a scaled-down reinterpretation. When a component differs from its source frame, fix it back to the source structure.
   - Record **every follow-up decision** with the user's exact reply and the date (for example "Toast: B", "Input border: Option A, accept 1.5:1").
7. Keep all values provisional. Do not write canonical JSON, update the approved `.lib.pen`, replace shared Pencil variables, or sync to code before explicit approval. Keep procedural instructions in this command and the skill; canvas text should describe design evidence and decisions.
8. Keep the template's bounded 1440 × 1080 presentation boards as a starting point. Use Pencil MCP to check each board for clipping, collapsed layout, text contrast, spacing, and alignment; capture and inspect each board's preview. Resize or split a board when content requires it, keeping alternative samples comparable. `problems` read right after a large insert can be stale, so re-run the layout scan in a separate `execute` before fixing anything. Fix nodes in place.
9. Ask the user to approve the selected direction, expanded token set, themes/modes, accessibility assumptions, primitives, and resolution or explicit deferral of gaps/conflicts. Record the actual response in the decision record; never infer approval from a completed canvas or copied demo labels.

MCP edits are not on disk until the user presses ⌘S in Pen. Ask them to save `exploration.pen` before you report the canvas as recorded.

Finish with the completion report, and recommend `/sdv:save-design-system` only after approval.
