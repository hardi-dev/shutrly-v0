# Prompt — update the `sdv` plugin's design-system workflow (→ v1.4.0)

> Paste everything below the line into a Claude Code session opened in the **sdv plugin repository**
> (`~/.claude/plugins/marketplaces/local-desktop-app-uploads/sdv` or its source repo).

---

You are updating the `sdv` Claude Code plugin (currently **v1.3.6**) — specifically the `sdv-design-tokens-system` skill and the design-system commands — using lessons and artifacts from a real project run (Shutrly, 2026-09-26). Read the plugin first, then the project artifacts, then make the changes below. Work in a branch, keep changes reviewable, and don't touch the `spec-driven-vibe-coding` skill except `/sdv:help` wording where noted.

## 0. Read first

Plugin (target of the edits):
- `skills/sdv-design-tokens-system/SKILL.md`, `references/token-architecture.md`, `references/pen-dev-mapping.md`
- `skills/sdv-design-tokens-system/assets/templates/*` (note: `design-system-library.lib.pen` and `feature-consumer.pen` are empty 96-byte stubs)
- `skills/sdv-design-tokens-system/scripts/validate_tokens.py`
- `commands/design-system.md`, `design-tokens.md`, `save-design-system.md`, `sync-pencil.md`, `verify-design-system.md`, `help.md`
- `README.md`, `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`

Project artifacts to learn from / reuse (absolute paths, read-only — do not modify the project):
- Library (to become the new template): `/Users/hardiansa/Documents/work/personal/Coding/shutrly-v01/docs/design-system/design-system.lib.pen` — open with `open -a Pen <path>` and inspect **only via Pencil MCP** (never Read/cat a `.pen`). It holds 289 variables (theme axis `mode: light|dark`) and 9 documentation boards: `00 — Cover`, `01 — Color · primitives`, `02 — Color · semantic`, `03 — Typography`, `04 — Spacing · radius · opacity`, `05 — Elevation`, `06 — Component tokens`, `07 — Usage rules`, `08 — Spacing rules`. No reusable components yet.
- `.../docs/design-system/tokens.json` — DTCG, light in `$value`, dark in `$extensions["dev.pen.modes"].dark`
- `.../docs/design-system/pencil-mapping.json` — includes `themes`, `transforms`, `unsupported`, `library_canvas`, `components_status`
- `.../docs/design-system/token-usage.md` — token + spacing usage rules (G1–G8, colour tables, SP1–SP11, inset/stack/inline, layout map)
- `.../docs/design-system/verification-report.md` — a real verify report (checks table, blocking vs non-blocking)
- `.../docs/design-system/scripts/gen_tokens.py` — project token generator (definitions → tokens.json + mapping + Pencil payload); `verify_json.py` (tokens.json ⇄ mapping ⇄ Pencil payload + layer rules); `verify_vars.py` (FNV-1a checksum, mirrored in Pencil MCP JS); `pencil-canvas-builders.md` (the MCP `execute` snippets/specs that drew boards 00–08)
- `.../docs/design-system/exploration.pen` — exploration boards incl. added toast (§09) and form studies (§10a/10b), true-scale representative case, decision record

## 1. Replace the empty library template with a documented token-canvas template

1. Build `assets/templates/design-system-library.lib.pen` from the project library's **structure**, but **neutralize all project content** so it is a clearly labeled demo, mirroring how `design-system-exploration.pen` uses the fictional **Forma** brand:
   - Keep boards 00–08, their layout, the variable-bound previews, dark (`theme: {mode: "dark"}`) preview frames, contrast badges, redline convention, and the do/don't card patterns.
   - Replace Shutrly names, Indonesian sample copy (e.g. "Rp 42,6 jt", "Menunggu DP", "Pemotretan"), stage-chip mapping, and "Studio Lime" with Forma demo content; mark the cover `DEMO ONLY — replace on persistence`.
   - Replace the variable set with a smaller neutral demo set that still exercises every layer (primitives incl. alpha, themed semantics, component tokens incl. padding/gap/radius) so every board renders.
   - Static texts computed at build time (hex labels, contrast ratios, token counts, "px" values) must be regenerated after the variables change — document this.
   - Investigate the `fileToken` in the current stub (`{"version":"2.19","children":[],"fileToken":…}`): decide whether a template copied into many projects must get a fresh token/library identity, and document the rule.
2. Keep the library free of feature screens; reusable components are a separate step (§4.5).

## 2. Encode the persistence pipeline (save-design-system)

Update `commands/save-design-system.md` and SKILL.md:
1. `tokens.json` is canonical. Add a **generic** script `scripts/tokens_to_pencil.py` (derive from `gen_tokens.py` / `verify_json.py`, but read `tokens.json` instead of hard-coded definitions) that emits: the Pencil `SetVariables` payload (`$a/b/c` refs, per-mode arrays), `pencil-mapping.json` (variables, counts, themes, transforms, unsupported, library_canvas), and an FNV-1a checksum per group + total.
2. Mode representation: light in `$value`, other modes in `$extensions["dev.pen.modes"].<mode>`; theme axes in root `$extensions["dev.pen.themes"]`. Update the `tokens.json` and `pencil-mapping.json` templates accordingly.
3. Pencil representation rules (put in `references/pen-dev-mapping.md`):
   - Opacity variables are **percent** in Pencil (token 0.4 → variable 40); literal `opacity` on nodes is 0–1. Record under `transforms`.
   - `width`/`height` cannot bind to number variables (resolve to 0); spacing tokens are applied via `padding`/`gap` only.
   - Composite typography and shadow are split into scalar tokens (size/weight/letter-spacing/line-height; offset-y/blur + themed colour) and recorded under `unsupported`.
   - Dark tints use alpha primitives (`#RRGGBBAA`) rather than opacity.
   - Variable names are token paths with `/`; `SetVariables` merges, so check for removed tokens explicitly.
4. After `SetVariables`, build/refresh the token canvas (boards 00–08) from the builders reference — move `pencil-canvas-builders.md` into `references/` and generalize it.
5. **Disk-save gate**: MCP edits live in the open Pen document until the user saves. After persisting, check the `.lib.pen` size/mtime on disk; if it is still the template stub, tell the user to press ⌘S and do not report "persisted" until saved.
6. Component tokens must cover **colour + padding/gap + radius** (the run failed verification for missing padding/gap tokens). Add a coverage checklist per component (button, nav, chip, metric, calendar, toast, input, checkbox, switch, segmented, table, panel).
7. Update the exploration decision record (board 03) with `PERSISTED <date>` and what was/wasn't built.

## 3. Upgrade the validator and verification

1. Extend `validate_tokens.py` (or add `verify_tokens.py`): validate mode aliases in `$extensions["dev.pen.modes"]` (existence + type), 8-digit hex, layer rules (semantic → primitive only; component → semantic/scale only; no raw values in component tokens), and optionally compare against `pencil-mapping.json` and a Pencil payload.
2. `commands/verify-design-system.md`: add the procedures used in the run —
   - checksum equality between live Pencil variables (JS in `execute`) and the repo payload;
   - library canvas scan: broken `$` references, hard-coded colours with an **allowlist** for documentation backdrops/annotations, layout `problems` (ignore intentional clipping such as toast accent bars);
   - disk-save check; reusable component count; consumer existence (`docs/features/**/*.pen`) — "no consumers" is reported as *not applicable*, never as "linked";
   - light/dark preview check.
3. Add `assets/templates/verification-report.md` modeled on the project report (artifacts table, numbered checks with PASS/FAIL/N/A + evidence, blocking vs non-blocking, CONFLICT / DESIGN TOKEN GAP / representation notes, smallest corrective workflow).

## 4. Add token usage rules as a first-class artifact

1. Add `assets/templates/token-usage.md` generalized from the project file (keep structure: global rules G1–G8 + decision path; colour tables *use for / don't use for* per role; typography styles; **spacing §4: SP1–SP11, inset types, stack & inline ladders, layout map, optical exceptions**; radius; elevation; opacity; accessibility; branding). Replace Shutrly specifics with placeholders/examples; keep the research basis line (Atlassian, Primer, Carbon, Polaris, EightShapes).
2. Save-design-system (or a new `/sdv:design-rules` step — your call, justify it) generates `docs/design-system/token-usage.md` from the project's tokens and builds boards 07/08. Rules start `PROPOSED`; require explicit user approval before marking `APPROVED`, same gate style as tokens.
3. SKILL.md: agents must follow `token-usage.md` when designing features and when building library components; `/sdv:verify-feature` and `/sdv:design-feature` should reference it.
4. Before writing rules or the token canvas for a new project, do a short research pass and cite sources in the report.
5. Library components (next step after tokens): build reusable components bound to `component/*` variables, document each with `component-spec.md`, and add them to board 06/the canvas index.

## 5. Improve the exploration workflow (`/sdv:design-system`)

Lessons from the run:
1. **Legacy designs path**: users may reject generated directions and point to earlier designs (e.g. a zip of `.pen` files). Extract to a scratch directory (never modify the original), open in Pen, inspect via MCP, and let the user copy chosen frames into `exploration.pen` (cross-file copy via MCP means round-tripping large JSON through context — prefer the user copying). Record the user's canvas selection as the chosen direction and legacy frame IDs as evidence.
2. **Observed-value extraction**: frequency stats over selected frames (fills, strokes, radii, gaps, paddings, font sizes/weights) → OBSERVED; surface mixed palettes (e.g. zinc vs slate), duplicate brand colours, and off-grid values as `CONFLICT`s with a recommendation; fold them only on explicit user decision.
3. Representative case must be **true scale** built from the user's picks, not a scaled-down reinterpretation; when a component differs from its source frame, fix it to the source structure.
4. Allow additional studies on board 02 (e.g. feedback/toast variants, form elements, border options) and record every follow-up decision (user's exact reply) in the decision record.
5. Contrast arithmetic for action colours (e.g. white on candidate blues) should drive recommendations; record accepted exceptions (e.g. input border below 3:1) as accepted gaps with mitigations.
6. Pencil MCP gotcha: `problems` from `Get` can be stale right after large inserts — re-run the scan in a separate `execute` before fixing.

## 6. Housekeeping

- Bump version to **1.4.0** in both plugin manifests; add a CHANGELOG entry summarizing the above.
- Update `README.md` layout and `/sdv:help` (design-system branch now includes: persist tokens → token canvas → usage/spacing rules → approve rules → build components → verify; list new templates/scripts).
- Keep all existing guardrails: approval gate, `open -a Pen` before MCP, no `pen` CLI for design content, never overwrite project files without confirmation.
- Validate: run the extended validator on the new `tokens.json` template; open every `.pen` template in Pen and check via MCP that boards render with no broken variable refs or layout problems; confirm the library template is marked/usable as a library and a copied `feature-consumer.pen` can import it.

Deliver: a summary of changed/added files, the validation evidence, and any open decisions (e.g. `fileToken` handling, new command vs. extended save step).
