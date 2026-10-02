# Design-system verification report

- Date: `<YYYY-MM-DD HH:MM local>`
- Scope: token files, Pencil variables/themes, library source + token canvas, usage rules, exploration record, components, consumers
- Direction: `<direction name>` — `APPROVED <date>` (exploration board 03 decision record)
- **Result: `COMPLETE` | `NOT COMPLETE — <n> blocking finding(s)`** — one sentence on what passes and what blocks.
- Updates: append a dated line per re-run (`<time>: <what changed>; checks re-run`). Strike through resolved findings; don't delete them.

## Artifacts checked

| Artifact | Path | State |
|---|---|---|
| Canonical tokens | `docs/design-system/tokens.json` | `<n>` tokens, on disk |
| Pencil payload | `docs/design-system/pencil-variables.json` | `<n>` variables · checksum `<fnv1a>` |
| Pencil mapping | `docs/design-system/pencil-mapping.json` | `<n>` variables · counts · transforms · unsupported |
| Usage rules | `docs/design-system/token-usage.md` | `PROPOSED` / `APPROVED <date>` |
| Library source | `docs/design-system/design-system.lib.pen` | Saved `<time>` (`<bytes>`): `<n>` variables, `<n>` boards, `<n>` reusable components |
| Exploration | `docs/design-system/exploration.pen` | Saved `<time>`; decision record says `<status>` |
| Consumers | `docs/features/**/*.pen` | `<list>` or **None exist** |

## Checks and evidence

Result values: `PASS`, `PASS (intentional)`, `PASS after fix`, `FAIL (blocking)`, `FAIL (non-blocking)`, `N/A`. Evidence is the command, snippet result, count, checksum or screenshot — never "looks fine".

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | DTCG structure, types, hex format (`#RGB`/`#RRGGBB`/`#RRGGBBAA`), aliases, cycles | | `validate_tokens.py tokens.json` → |
| 2 | Mode values in `$extensions['dev.pen.modes']` declared on the axis, typed, resolvable | | |
| 3 | Layer rules: semantic → primitive only; component → semantic/scale only; no raw values in component tokens | | |
| 4 | Duplicate normalized Pencil names | | |
| 5 | tokens.json ⇄ payload (value, type, per-mode alias, opacity × 100) | | `validate_tokens.py --payload` → |
| 6 | Mapping coverage (`variables`, `counts`) | | `validate_tokens.py --mapping` → |
| 7 | Live Pencil variables ⇄ payload | | FNV-1a total `<hash>` in Pencil and repo (`<n>` variables); groups compared: |
| 8 | Removed tokens / extra live variables | | `<none>` or list (drift) |
| 9 | Theme axis + coverage | | `mode: [light, dark]`, default light; `<n>` themed tokens; rest mode-invariant by design |
| 10 | Variable references on library canvas | | `<nodes>` nodes, `<refs>` `$` references, **`<n>` broken** |
| 11 | Hard-coded values on library canvas | | raw colours outside allowlist: `<n>`; allowlisted backdrops/redline/deliberate Don't examples: `<n>` |
| 12 | Library canvas layout (`problems`, re-scanned in a separate call) | | `<n>` unexpected; intentional clipping inside `clip:true`: `<n>` |
| 13 | Static labels current (hex, contrast, counts, px) | | spot-check boards 00/02/04/06 against variables |
| 14 | Light/dark previews | | `<n>` light + `<n>` dark theme-scoped frames; screenshots of 02, 05, 06 reviewed |
| 15 | Library saved to disk | | size/mtime before `<…>` → after `<…>`; not the template stub |
| 16 | Usage rules (token-usage.md, boards 07/08) | | status `PROPOSED`/`APPROVED`; references resolve |
| 17 | Component token coverage (colour + padding/gap + radius per component) | | checklist below |
| 18 | Reusable components in library | | `reusable: <n>`, `instances: <n>`; each has a component spec |
| 19 | Consumer links / instances vs copied geometry | | `N/A — no consumers` (never "linked") or per-file result |
| 20 | Exploration file isolation | | `<n>` variables, `<n>` reusable, `<n>` instances — local studies only |

### Component token coverage

| Component | Colour | Padding / gap | Radius | Library component | Spec |
|---|---|---|---|---|---|
| button | | | | | |
| nav | | | | | |
| chip | | | | | |
| metric | | | | | |
| calendar | | | | | |
| toast | | | | | |
| input | | | | | |
| checkbox | | | | | |
| switch | | | | | |
| segmented | | | | | |
| table | | | | | |
| panel | | | | | |

## Deviations

### Blocking
1. `<finding>` — evidence, impact, fix.

### Non-blocking — CONFLICT / normalization drift
| Where | Shown | Persisted token | Resolution |
|---|---|---|---|
| | | | |

### Non-blocking — DESIGN TOKEN GAP
- `<gap>` — deferred / accepted with mitigation (quote the user's decision).

### Non-blocking — Pencil representation notes
- Opacity variables are percent in Pencil (`40` ↔ token `0.4`); recorded under `pencil-mapping.json › transforms`.
- Width/height cannot bind to number variables; spacing is applied through padding/gap (`unsupported.size-binding`).
- Composite typography and shadow are split into scalar tokens (`unsupported.typography`, `unsupported.shadow`).

## Research sources
List the sources consulted for token canvas and usage rules (only when rules were written or changed in this run).

## Smallest corrective workflow
1. `<one action per blocker, in order>` (e.g. "Save `design-system.lib.pen` in Pen (⌘S)", "continue `/sdv:save-design-system` components phase", "`/sdv:design-rules` approval").
2. Re-run `/sdv:verify-design-system`.
