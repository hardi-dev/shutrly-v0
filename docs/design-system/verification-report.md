# Design-system verification report

- Date: 2026-09-26 (03:15 local)
- Scope: token files, Pencil variables/themes, library source, exploration record, consumers
- Direction: S / Studio Lime — APPROVED by user 2026-09-26 (exploration board 03 decision record)
- **Result: NOT COMPLETE — 1 blocking finding** (reusable components not built). Token layer passes.
- Update 2026-09-26 03:2x: library saved (blocker 1 cleared); 43 padding/gap/radius + segmented/table component tokens added (246 → 289); all checks re-run.

## Artifacts checked

| Artifact | Path | State |
|---|---|---|
| Canonical tokens | `docs/design-system/tokens.json` | 289 tokens, on disk |
| Pencil mapping | `docs/design-system/pencil-mapping.json` | 289 variables, on disk |
| Library source | `docs/design-system/design-system.lib.pen` | Saved 03:17 (1.1 MB): 289 variables + 7 token boards. Save again in Pen to persist the 43 new variables and rebuilt board 06 |
| Exploration | `docs/design-system/exploration.pen` | Saved 03:03; decision record says "tokens PERSISTED 2026-09-26" |
| Consumers | `docs/features/**/*.pen` | **None exist** |

## Checks and evidence

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | DTCG structure, types, aliases | PASS | `validate_tokens.py docs/design-system/tokens.json` → `OK` |
| 2 | Dark-mode aliases (`$extensions['dev.pen.modes'].dark`) resolve with matching types | PASS | Generator check + independent cross-check: 0 issues |
| 3 | Duplicate normalized Pencil names | PASS | 289 unique `a/b/c` names |
| 4 | tokens.json ⇄ Pencil variables (value, type, per-mode alias) | PASS | Rebuilt variables from tokens.json independently: 0 missing, 0 extra, 0 mismatched |
| 5 | Pencil variables (live document) ⇄ generated payload | PASS | FNV-1a checksum over all 289 canonicalized variables: `37f6438f` in Pencil and repo |
| 6 | Mapping coverage | PASS | 289/289 token paths mapped; 0 extra mapping entries |
| 7 | Layering rules | PASS | Every semantic colour aliases a primitive (both modes); no component token aliases a primitive or holds a raw value |
| 8 | Theme axis + coverage | PASS | `mode: [light, dark]`, default light; 46 themed tokens carry both modes; the rest are mode-invariant by design |
| 9 | Variable references on library canvas | PASS | 2,329 nodes, 2,940 `$` references, **0 broken** |
| 10 | Hardcoded values on library canvas | PASS (intentional) | 3 raw colours, all documentation backdrops: `#FFFFFF`/`#18181B` behind alpha swatches, `#FFFFFF`/`#E4E4E7` opacity checkerboard |
| 11 | Library canvas layout | PASS after fix | 1 clipped title on 00 — Cover index card ("Spacing · radius · opacity") → set to wrap; re-check 0 problems |
| 12 | Light/dark previews | PASS | 126 light + 126 dark theme-scoped preview frames; dark columns on 02 — Color · semantic and dark row on 05 — Elevation resolve dark values (screenshots reviewed) |
| 13 | Reusable components in library | **FAIL (blocking)** | `reusable: 0`, `instances: 0`. Component tokens exist (91) but no Button, Toast, Text Field, Metric Tile … components |
| 14 | Library saved to disk | PASS | Saved 03:17 (1,145,297 bytes). Latest token additions need one more ⌘S |
| 15 | Consumer links / instances vs copied geometry | NOT APPLICABLE | No feature `.pen` consumers exist; the library is **not claimed as linked** anywhere. Import capability unproven until a consumer imports it |
| 16 | Exploration file isolation | PASS | 0 variables, 0 reusable components, 0 instances — local studies only; not a consumer |

## Deviations

### Blocking
1. ~~Library not persisted to disk~~ — resolved 03:17.
2. **No reusable components.** The approved primitives (buttons, segmented control, stage chips ×5, nav item + count, metric tile per Frame 4, calendar day, toast B ×5, text field states per Option A, checkbox/radio/switch/stepper) exist only as local studies in `exploration.pen`, not as library components bound to the component tokens.

### Non-blocking — CONFLICT / normalization drift (exploration vs persisted tokens)
These are approved normalizations (CONFLICT-01…03 resolutions); the exploration still shows pre-normalization values in places:

| Where (exploration) | Shown | Persisted token |
|---|---|---|
| Stage chip "Pemotretan" bg | `#F2FCD2` | `lime.50` `#F4FBDF` via `accent.soft` |
| Sample buttons padding-x | 18 | `button.md.padding-x` → `space.4` = 16 |
| Stage chip padding | 3 / 9 | not tokenized (see gap below) |
| Legacy frames (buKOi, Frame 1–4) & board 03 true-scale case | weight 800 on day numbers / % | `font.weight.bold` 700 (800 folded) |
| Legacy frames | `#2F6BFF`, slate greys | retired; board 03 case already normalized |

### Non-blocking — DESIGN TOKEN GAP
- ~~Padding/gap component tokens missing~~ — resolved: 43 tokens added (button gap; nav item/count; chip stage; metric delta; calendar day; toast; input gaps; checkbox gap; segmented colours + spacing; table colours + spacing; app panel header/content spacing). Values snapped to the 4 px scale from observed legacy values (e.g. chip 3/9 → 2/8, nav 9 → 8, segmented item 14 → 12, count 1/7 → 2/8).
- Text styles are composite: stored as separate size / weight / letter-spacing / line-height tokens; no Pencil text-style object (recorded in `pencil-mapping.json › unsupported`).
- Shadows are composite: split into `elevation.N.offset-y`, `elevation.N.blur` and themed `color.semantic.elevation.N.color`.
- Deferred product gaps from the decision record remain open: GAP-01 dark evidence, GAP-02 interaction/error states beyond those drawn, GAP-03 brand-override rules, GAP-04 client gallery, GAP-05 copy language. GAP-06 (input border contrast) accepted by user.

### Non-blocking — Pencil representation notes
- Opacity variables are stored as percent in Pencil (`40` ↔ token `0.4`); transform recorded in `pencil-mapping.json › transforms`.
- Width/height cannot bind to number variables in Pencil; spacing is applied through padding/gap bindings (recorded under `unsupported.size-binding`).

## Smallest corrective workflow
1. Save `design-system.lib.pen` in Pen (⌘S) to persist the 43 new variables.
2. Build the reusable components in `design-system.lib.pen` bound to `component/*` variables (continue `/sdv:save-design-system`, component step) — clears the remaining blocker.
3. When the first feature design starts, copy `feature-consumer.pen`, import the library, place linked instances, then re-run `/sdv:verify-design-system` to confirm the import/link.
