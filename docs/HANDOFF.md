# Handoff — Shutrly

Last updated: 2026-09-26 (session 2) · Read this first when resuming work, then [docs/README.md](README.md).
Branch: `design-system/library-components` (not pushed, not merged into `main`).

## Where we are

| Area | Status | Notes |
|---|---|---|
| Project bootstrap (product, domain, architecture, ADR-001…012, constitution, coding rules) | DONE (2026-09-25) | Authoritative tree under `docs/`; `_source/` is historical. |
| F-01 Auth | SPECIFIED | `docs/features/auth/spec.md` + acceptance criteria. Not modelled or designed yet. |
| Design system — exploration | APPROVED (2026-09-26) | Direction **S / Studio Lime**, curated by the Owner from legacy frames. |
| Design system — tokens | PERSISTED (2026-09-26) | **359 tokens** (58 primitive · 52 semantic · 200 component · scales), `mode: light \| dark`. Live checksum `9ebc8db7`. |
| Design system — token canvas | DONE | Boards 00–08, refreshed for every token added this session. |
| Design system — usage & spacing rules | APPROVED (2026-09-26) + Owner amendments | See *Key decisions*. |
| Design system — primitive components | **BUILT** — C01 APPROVED · C02–C17 PROPOSED | 17 components (108 reusable nodes) in `design-system.lib.pen`, each with a spec in `components/`. |
| Design system — composite components (tier 2–3) | NOT STARTED | Text field, nav item, segmented control, toast, calendar day, metric tile, select / multi-select / action menu, table row, app panel. |
| Code | NONE | No app scaffold yet (F-00 Foundation is TODO). |

## Component library (`design-system.lib.pen`)

**Canvas layout:** token boards 00–08 are on the top row (y = 0). Component pages start at **y = 6800**, 8 per row, ordered by group. Each page is a 1440-wide frame named `Cxx — Name`.

| Row | Pages |
|---|---|
| 1 (y 6800) | **Actions:** C01 Button · C02 Icon button · **Form controls:** C03 Input · C04 Textarea · C05 Checkbox · C06 Radio · C07 Switch · C08 Stepper |
| 2 (y 9359) | **Menus:** C09 Menu item · C10 Menu · **Navigation:** C11 Segmented item · **Status:** C12 Stage chip · C13 Count badge · C14 Notification badge · C15 Metric delta · **Display:** C16 Avatar |
| 3 (y 11983) | **Display:** C17 Kbd |

**The pattern** (Figma best practice adapted to pen.dev; the Button pilot was approved by the Owner):

- **Structure:**
  - A private base, `_X/Base`, holds the structure.
  - Every variant is a **reusable instance of the base**, named `X/<Type>/<Size>/<State>`.
  - Each variant has a `context` that describes its properties.
- **Properties:**
  - Booleans are optional layers with `enabled`.
  - Text properties are `descendants` content overrides.
  - Instance swaps are icon names or nested refs.
  - Slots are frames with `slot:[ids]` (Menu `Items`).
- **Page exhibits:**
  - Component set
  - Content / Configurations
  - Modes (light and dark)
  - Usage (do / don't)
  - Accessibility
  
  Anatomy, properties, layout and token tables live **only** in the `.md` spec (Owner decision).
- **Specs:** `docs/design-system/components/<name>.md`.
- **Registry:** `components/registry.json`, hand-maintained, with IDs, axes, props, layers and variants. `gen_tokens.py` merges it into `pencil-mapping.json › components`.
- **Rollout so far:**
  - Pilot: C01 Button.
  - Tier 1: C05–C07, C12, C13.
  - Tier 1b: C02–C04, C08, C11, C14–C17.
  - Tier 1c: C09–C10 menus. These have **no legacy evidence** and need a careful review.

## Design-system artifacts (`docs/design-system/`)

| File | Role |
|---|---|
| `exploration.pen` | Provisional canvas: boards 01–03 (directions, token studies, true-scale case, **decision record**, now including the rules approval) and the Owner's copied legacy frames. |
| `design-system.lib.pen` | Approved library: 359 Pencil variables, theme axis `mode`, boards 00–08, and component pages C01–C17. |
| `tokens.json` | Canonical DTCG tokens. **Generated: edit `scripts/gen_tokens.py`, not this file.** |
| `pencil-mapping.json` | Token ⇄ Pencil variable map, transforms, `library_canvas` (`rules_status` APPROVED), `components` (from the registry), `components_status`. Generated. |
| `token-usage.md` | Usage rules G1–G8 and SP1–SP11. APPROVED 2026-09-26, with the amendments recorded in its status line. |
| `components/*.md`, `components/registry.json` | Component specs and the machine-readable registry. |
| `verification-report.md` | **Stale:** the last `/sdv:verify-design-system` ran before any components existed. |
| `scripts/gen_tokens.py` | Token source of truth and generator. It also merges `components/registry.json`. |
| `scripts/verify_json.py`, `verify_vars.py` | JSON ⇄ mapping ⇄ payload checks, plus the FNV-1a checksum. The current total is `9ebc8db7` (359 vars). |
| `scripts/pencil-canvas-builders.md` | Pencil MCP snippets for boards 00–08. |

The root files `design.pen` (unused) and `dont-touch-old-design.zip` (legacy source; never modify) are intentionally untracked.

## Key decisions (Owner)

**Earlier (session 1):**
- The Studio Lime pieces were taken from the legacy frames.
- `blue.500 = #2F5BFF` in both modes.
- Slate folded into zinc, and spacing snapped to 4 px.
- Full light and dark themes (dark values inferred, GAP-01).
- Toast style B, and input border Option A (GAP-06 accepted).
- The metric tile follows legacy Frame 4 exactly.

**Session 2 (2026-09-26):**
- **Rules approved** ("approve"). Any later change to an approved rule is recorded as an amendment.
- **Component method:** research Figma best practice first, then adapt it to pen.dev and pilot it on one component. The first flat "Library components" gallery was rejected and deleted.
- **Whole steps only outside SP6's small components:**
  - Button padding: MD **12/36**, LG **16/48** (3:1 squish). **`space.9` = 36** was added to the scale.
  - Checkbox, radio and switch ↔ label gap: 10 → **8**.
  - Segmented: item 6/12 → **8/16**, track padding and gap 2 → **4**.
- **Buttons:** icons are allowed on both sides (`Icon leading` / `Icon trailing`, off by default). Secondary buttons got a hover state (`surface.sunken`).
- **Hover tokens** for checkbox, radio and switch. New semantics: `border.control-hover` and `control.track-off-hover`.
- **Stepper "+"** uses `action.primary` (the same as Button primary), and "−" is neutral.
- **Tier 1b primitives:** Input (plus search, and password/select/date/prefix configurations), Textarea, Segmented item, Metric delta, Stepper, Avatar, Icon button, Notification badge (new semantic `status.danger.on-solid`), and Kbd.
- **Tier 1c:** Menu item and Menu, for dropdown / select / action menu.
- **Canvas:** components sit below the tokens, 8 per row, ordered by group. The C-codes were renumbered to match the canvas order.

## Open gaps (deferred)

- GAP-01 dark-mode evidence
- GAP-02 loading states (button, switch) and states beyond those drawn
- GAP-03 workspace brand-override rules
- GAP-04 client gallery (mobile)
- GAP-05 EN/ID copy mix (id-ID assumed)
- Tabular figures for money and time
- No negative (red) metric delta tone
- Menu components have no legacy evidence
- `nav.count.*` should be renamed to `count-badge.*` if the badge is used outside navigation

## Next steps

1. **Owner review** of C02–C17 (especially C09–C10 menus). Mark each APPROVED in its spec and in `registry.json` status.
2. **Tier 2 composites**, built from nested primitive instances:
   - Text field: Input + label + helper/error.
   - Nav item: + Count badge.
   - Segmented control: track + Segmented items.
   - Toast (style B): + ghost Icon button.
   - Calendar day.
   - Metric tile: + Metric delta.
   - Select, Multi-select and Action menu: trigger + Menu.
   
   Settle the half-step question for toast `text-gap` (2) and table `cell.gap` (10) as each one comes up.
3. **Tier 3:** table header and row (Avatar + Stage chip), and the app panel (header + content slot).
4. Re-run `/sdv:verify-design-system`; the verification report is stale.
5. Merge the branch, then resume the feature track: `/sdv:discover-feature workspace` (pair it with F-01 Auth) → model → design.

## Working notes / gotchas

- Open `.pen` files with `open -a Pen <abs-path>`, and inspect or edit them only via the Pencil MCP.
- **Pen does not autosave MCP edits.** Press ⌘S in each Pen window, and check the file mtime and size before committing.
- **`TakeScreenshot` only renders the file in the frontmost Pen window** (otherwise it's blank). Run `open -a Pen <file>` first. Screenshots of nodes created in the same call can be stale, so take them in a separate call.
- **Pencil limits:**
  - Opacity variables are percent, and binding `opacity:"$opacity/disabled"` resolves to 0.4.
  - `width`/`height` can't bind to variables.
  - There's no `wrap` on frames and no stroke offset or spread (focus = 2 px outer ring + `focus/glow`; the offset is handled in code).
  - `metadata` is dropped on `ref` nodes, so variant axes live in `context` and the registry.
- **Slots:** `Insert(instance+"/slot")` is refused. Use `Replace(instance+"/slotId", {type:"frame",…})`, then Insert into the new frame. A `Get` visitor that walks into an instance with a replaced slot throws, so scans call `ctx.skipChildren()` on non-reusable refs.
- `Get` layout `problems` can be stale right after big inserts, so re-scan in a separate call. Hidden (`enabled:false`) layers in bases show as "clipped"; that's expected.
- **Token change workflow:**
  1. Edit `scripts/gen_tokens.py`.
  2. Run `gen_tokens.py`, then `verify_json.py`.
  3. `SetVariables` with the changed keys from `scripts/pencil-vars.json`.
  4. Compare the checksum (`verify_vars.py` against the FNV JS in Pencil).
  5. Refresh boards 02 and 06 and the cover counts.
  6. Update the registry and specs.
  7. ⌘S.
- **Shell:** `head` on this machine isn't coreutils; use `sed -n`.
