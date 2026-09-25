# Handoff — Shutrly

Last updated: 2026-09-26 · Read this first when resuming work, then [docs/README.md](README.md).

## Where we are

| Area | Status | Notes |
|---|---|---|
| Project bootstrap (product, domain, architecture, ADR-001…012, constitution, coding rules) | DONE (2026-09-25) | Authoritative tree under `docs/`; `_source/` is historical. |
| F-01 Auth | SPECIFIED | `docs/features/auth/spec.md` + acceptance criteria. Not modelled/designed yet. |
| Design system — exploration | APPROVED (2026-09-26) | Direction **S / Studio Lime**, curated by the Owner from legacy frames. |
| Design system — tokens | PERSISTED (2026-09-26) | 289 tokens (58 primitive · 49 semantic · 134 component · scales), `mode: light | dark`. |
| Design system — token canvas | DONE | Library boards 00–08 bound to live variables. |
| Design system — usage & spacing rules | PROPOSED | `token-usage.md` + boards 07/08; awaiting Owner approval. |
| Design system — reusable components | NOT STARTED | **Blocking** for feature design (see verification report). |
| Code | NONE | No app scaffold yet (F-00 Foundation is TODO). |

## Design-system artifacts (`docs/design-system/`)

| File | Role |
|---|---|
| `exploration.pen` | Provisional canvas: boards 01–03 (directions, token studies incl. toast §09 and form §10a/10b, true-scale case, decision record) + the Owner's copied legacy frames (buKOi, Frame 1–4). |
| `design-system.lib.pen` | Approved library: 289 Pencil variables, theme axis `mode`, documentation boards 00 Cover · 01–05 Foundations · 06 Component tokens · 07 Usage rules · 08 Spacing rules. No components yet. |
| `tokens.json` | Canonical DTCG tokens. Light = `$value`, dark = `$extensions["dev.pen.modes"].dark`. **Generated — edit `scripts/gen_tokens.py`, not this file.** |
| `pencil-mapping.json` | Token path ⇄ Pencil variable, transforms (opacity ×100), unsupported composites, canvas board list. Generated. |
| `token-usage.md` | Usage rules (G1–G8, colour tables, typography, spacing SP1–SP11, radius, elevation, opacity, a11y). PROPOSED. |
| `verification-report.md` | Last `/sdv:verify-design-system` result: tokens PASS; blocker = no reusable components. |
| `scripts/gen_tokens.py` | Token source of truth + generator → `tokens.json`, `pencil-mapping.json`, `scripts/pencil-vars.json` (Pencil `SetVariables` payload). |
| `scripts/verify_json.py`, `verify_vars.py` | Cross-check JSON ⇄ mapping ⇄ payload + layer rules; FNV-1a checksum (current: `37f6438f`, 289 vars). |
| `scripts/pencil-canvas-builders.md` | Pencil MCP snippets/specs used to draw boards 00–08. |
| `sdv-skill-update-prompt.md` | Prompt for updating the `sdv` plugin with this run's lessons (run in the plugin repo, not here). |

Root files: `design.pen` (pre-existing, not used by this work) and `dont-touch-old-design.zip` (legacy source — never modify; extracted copies were only made in a scratch dir).

## Key decisions (Owner, 2026-09-26)
- Rejected generated directions A–C; chose pieces from the legacy exploration (dashboard shell, day timeline, booking table, week card, metric tiles).
- `blue.500 = #2F5BFF` in **both** modes (white label, 4.94 : 1); `#2F6BFF` and dark `#6B93FF` retired.
- Legacy slate greys folded into zinc; off-grid spacing/radius snapped to the 4 px scale.
- Full light + dark. Dark values are inferred (GAP-01).
- Toast style **B (tinted surface)**. Form input border **Option A** (`neutral.300` | `neutral.700`); GAP-06 (below 3 : 1) accepted with mitigations.
- Metric tile follows legacy Frame 4 exactly (structure, sparkline, lime-100 delta).

## Open gaps (deferred)
GAP-01 dark-mode evidence · GAP-02 interaction/error states beyond those drawn · GAP-03 workspace brand-override rules · GAP-04 client gallery (mobile) · GAP-05 EN/ID copy mix (id-ID assumed) · tabular figures for money/time.

## Next steps
1. Owner: approve (or edit) the usage + spacing rules → mark APPROVED in `token-usage.md` and boards 07/08.
2. Build reusable library components bound to `component/*` variables (button, nav item + count, stage chip ×5, metric tile, calendar day, toast B ×5, text field states, checkbox/radio/switch, segmented, table row, stepper, app panel); document each with a component spec.
3. Re-run `/sdv:verify-design-system`.
4. Resume the feature track: `/sdv:discover-feature workspace` (pair with F-01 Auth) → `/sdv:model-feature` → `/sdv:design-feature` (feature `.pen` files import the library and use linked instances).

## Working notes / gotchas
- Open `.pen` files with `open -a Pen <abs-path>`; inspect/edit only via Pencil MCP (never read `.pen` as text, never use the `pen` CLI for design content).
- **Pen does not autosave MCP edits** — press ⌘S in each Pen window; check file mtime/size before trusting the disk.
- Pencil: opacity variables are percent (40 = 0.4); literal node `opacity` is 0–1; `width`/`height` can't bind to variables (use padding/gap); `Get` layout `problems` can be stale right after big inserts — re-scan in a separate call.
- Token change workflow: edit `scripts/gen_tokens.py` → `python3 docs/design-system/scripts/gen_tokens.py` → `python3 docs/design-system/scripts/verify_json.py` → apply `scripts/pencil-vars.json` via Pencil `SetVariables` → compare checksum (`verify_vars.py` vs the same FNV JS in Pencil) → refresh affected boards → ⌘S.
- Shell note: `head` on this machine is not coreutils `head` (it's an HTTP tool); use `sed -n` instead.
