---
description: Write and approve token usage and spacing rules (token-usage.md + library boards 07/08) from the persisted tokens
argument-hint: "[design-system.lib.pen] [approve]"
model: claude-sonnet-5-5
effort: medium
---

Use the `sdv-design-tokens-system` skill and run its **design-rules** workflow for: **$ARGUMENTS**

The rules say which token to use, when to use it, and what never to do. They are a separate artifact with a separate approval gate: tokens can be approved while the rules are still `PROPOSED`, and a rules revision does not re-persist tokens. Run this command after `/sdv:save-design-system` phases A and B, and before its components phase. Re-run it whenever token roles change.

Guardrails:

- Open the library with `open -a Pen <absolute-path>` before using Pencil MCP, and pass `filePath` on every `execute` call.
- Never read a `.pen` file from the terminal, and never use the `pen` CLI for design content.
- Never overwrite an existing `token-usage.md` without confirmation. Propose a diff instead.

1. Preconditions: `tokens.json` validates, the library holds the persisted variables (the checksum matches), and the disk-save gate has passed. If not, recommend `/sdv:save-design-system`.
2. **Research pass.** Before writing rules for a new project, briefly review current guidance on:
   - choosing tokens by meaning (Atlassian);
   - base vs functional tokens and on-emphasis pairing (Primer);
   - layering and no absolute values (Carbon);
   - status roles (Polaris);
   - spacing: inset, squish, stack, inline (EightShapes "Space in Design Systems", Atlassian spacing).

   Add sources that fit the product (for example mobile touch targets). Cite every source actually consulted, in the `token-usage.md` footer and in the report.
3. Generate `docs/design-system/token-usage.md` from `skills/sdv-design-tokens-system/assets/templates/token-usage.md` and the project's `tokens.json`:
   - Keep the structure and IDs: G1–G8 with the decision path; §2 colour tables with "use for / don't use for" per role; §3 type styles; §4 spacing (SP1–SP11, inset types, stack and inline ladders, layout map, optical exceptions); §5 radius; §6 elevation; §7 opacity; §8 accessibility; §9 branding.
   - Fill it with the project's roles, values, domain-state → status mapping and examples, in the product's language.
   - Delete rows for roles the project lacks.
   - Compute the contrast figures the rules quote (for example action colour on panel per mode, accent on light), and record accepted exceptions with their mitigations.
   - Set the status line to `Rules: PROPOSED`.
4. Build or refresh boards `07 — Usage rules` and `08 — Spacing rules` in the library, using the patterns in `references/pencil-canvas-builders.md`:
   - rule cards with Do/Don't visuals built only from tokens, except deliberate hard-coded Don't examples;
   - redline specimens bound to the real padding/gap tokens;
   - the layout map;
   - a footer with the research basis and `Rules status: PROPOSED — awaiting approval`.
5. Check the boards: canvas scan (0 broken refs, no unexpected raw colours or layout problems, re-scanned in a separate call), screenshots, then the disk-save gate (⌘S, then size/mtime).
6. Ask the user to approve the rules. Show a summary of the global rules, the colour-role decisions, the spacing ladder and the accepted exceptions. Accept only an explicit approval. Record the exact reply and the date.
7. On approval:
   - Set `token-usage.md` to `Rules: APPROVED <date>`.
   - Set the footers on boards 07/08 to `APPROVED <date>`.
   - Set `pencil-mapping.json › library_canvas.rules_status` and `usage_rules`.
   - Note the approval in the exploration decision record.
   - Ask the user to save both `.pen` files.
8. On requested changes, revise and stay `PROPOSED`. Any later change to an approved rule returns it to `PROPOSED` until it is approved again.

Finish with the completion report:

- rules status;
- files changed and disk evidence;
- research sources;
- open `DESIGN TOKEN GAP` or `CONFLICT` findings;
- next step: `/sdv:save-design-system components` after approval, otherwise continued rule revision.
