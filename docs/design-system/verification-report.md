# Design-system verification report

- Latest run: **2026-09-28 23:11 WIB**
- Scope: shell-v3 token artifacts, live Pencil library, shell components, boards 06 and C40-C42,
  usage rules, exploration reload, and all three linked feature consumers.
- Direction: S / Studio Lime — APPROVED 2026-09-26.
- **Result: COMPLETE — no blocking findings.** Repository artifacts and the saved live library agree
  at 527 variables. Exploration and all three feature consumers were closed and reopened after the
  library save; every consumer exposes the new Page Header, Group and List Card imports with no broken
  token references in the targeted scan.
- Updates: shell-v3 usage rules, token retargeting, C28-C30/C35 shell masters, and new C40 Page Header,
  C41 Group and C42 List Card components. The Owner approved rules v3 with `ya` on 2026-09-28.

## Current verification

| # | Check | Result | Evidence |
|---|---|---|---|
| 1–6 | DTCG structure/types/aliases/modes/layers, normalized names, mapping and payload | PASS | `validate_tokens.py` with mapping + payload: `OK`; `pnpm tokens:css` and `pnpm tokens:check` pass. Generated artifacts contain 527 tokens: 64 primitive, 54 semantic and 345 component tokens. |
| 7 | Live Pencil variables ⇄ payload | PASS | Live library: 527 variables, FNV-1a `99143acb`, equal to the generated payload. Per-group checksums also match. |
| 8 | Removed / extra live variables | PASS | 0 missing and 0 extra live variables in the library payload comparison. |
| 9 | Theme axis + coverage | PASS | Live: `mode: [light, dark]`; 58 themed variables. The missing entries are non-colour values. |
| 10–12 | Canvas variable references, raw colours, layout | PASS (sampled) | Changed component roots plus board 06 and C40-C42: 2,822 nodes, 4,731 `$` references, 0 broken references and 0 raw colours. The Pencil root visitor remains unavailable, so this is a targeted sample. |
| 13–14 | Static labels and light/dark previews | PASS (sampled) | Desktop light, desktop dark and mobile shell screenshots were reviewed after the retarget. App Shell shows the muted shell, panel active-nav pill, canvas App Panel and the new Page Header hierarchy. |
| 15 | Library disk save | PASS | `design-system.lib.pen`: 4,299,374 bytes, 2026-09-28 23:03:59; saved after token and component updates. |
| 16 | Usage rules | PASS | `token-usage.md` records the approved L1-L3, B1-B2 and T1-T3 shell-v3 rules plus the accepted contrast exceptions. Board copy was updated to match. |
| 17–18 | Component coverage, specs and reusable components | PASS | Registry/specs include Page Header, Group and List Card. Pencil lists 227 reusable library components; the six new reusable roots/variants are `ImEDW`, `tEPBr`, `LBknS`, `uJwfh`, `XhLSK` and `swIYb`. |
| 19 | Consumer links / instances | PASS after reload | `workspace.pen` (`G:`), `auth.pen` (`a:`) and `message-templates.pen` (`F:`) each expose all 527 imported variables, including Page Header and List Card. Targeted scans found respectively 11,111 / 11,696 / 10,521 token references and 0 broken references. |
| 20 | Exploration reload | PASS | After the library save, `exploration.pen` was closed and reopened. It exposes the six new imported reusable components and the new shell-v3 token aliases under prefix `k:`. |

## Artifacts checked

| Artifact | State |
|---|---|
| `tokens.json`, `pencil-mapping.json`, `scripts/pencil-vars.json` | 527 tokens / 527 payload variables; canonical artifacts agree at checksum `99143acb`. |
| `design-system.lib.pen` | Saved 2026-09-28 23:03:59; 527 live variables and 227 listed reusable components. |
| `workspace.pen` | Reloaded linked Workspace consumer; 527 imported variables and 0 broken targeted refs. Pen displayed a transient “invalid data was skipped” opening notice, but the library components, variables and scanned references resolve. |
| `auth.pen` | Reloaded linked Auth consumer; 527 imported variables and 0 broken targeted refs. |
| `message-templates.pen` | Reloaded linked F-03 consumer; 527 imported variables and 0 broken targeted refs. |
| `exploration.pen` | Reloaded after the library save; new components and `k:` shell-v3 aliases are visible. |

## Deviations

### Pencil representation notes

- Opacity variables are percent-transformed in Pencil; size values cannot be bound to width/height.
- List Card therefore uses literal row height 44 in Pencil while code uses `size.list-row`.
- The Canvas root visitor is currently interrupted by Pencil MCP. Per-board/component scans and
  screenshots were used for the visual evidence above; re-run the whole-canvas scan after the MCP issue
  is resolved.
- `workspace.pen` showed a one-time “Some invalid data was skipped” notification on opening. The 527
  variables, new component imports and targeted token-reference scan are clean; retain this as a
  non-blocking Pencil serialization follow-up unless the notice repeats with visible loss.

## Smallest corrective workflow

1. Re-run the whole-canvas portion of `/sdv:verify-design-system` when the Pencil MCP root visitor is
   available; the sampled board/component evidence is clean.
2. If the Workspace opening notice repeats, inspect its skipped-data payload before saving that file.

## Historical report — superseded numerical evidence

> The record below is retained for history only. Its component counts and consumer-link findings predate
> C01 loading variants, C38 Empty State, C39 Toast and the Workspace consumer.

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
