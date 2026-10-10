# Design: bilingual copy revamp (F-22)

Status: **DESIGNED** (Owner approved and saved, 2026-10-11; `.pen` 56,443 bytes, mtime 2026-10-11 02:19 WIB).

## Pencil file

- File: `docs/features/bilingual-copy-revamp/bilingual-copy-revamp.pen` (copied from `skills/sdv-design-tokens-system/assets/templates/feature-consumer.pen`).
- Library: `docs/design-system/design-system.lib.pen`, imported through the Pen UI under alias `a:`. Confirmed through MCP: the App Shell, Mobile App Shell, Menu, Menu Item, Bottom Sheet and Sheet Item components resolve.
- The dashboard shell frames are rebuilt from `docs/features/app-shell-revamp/app-shell-revamp.pen` (`A4o4CS` desktop, `KqWRQ` phone) as library instances, because Pencil cannot copy across files. The F-17 canvas helper `Placeholder/Page content` is recreated locally (`pmPvn`).
- Frame copy is Indonesian, as in the source shell frames.

## Frames

| Frame | Pencil ID | State |
|---|---|---|
| D1 · Dashboard · desktop · light | `x7qwr` | Shell, menu closed |
| D2 · Account menu open · desktop · light | `TJlEh` | Account block opens the account menu |
| M1 · Dashboard · top-level · light | `v8vSQJ` | Shell, menu closed |
| M2 · Menu sheet open · phone · light | `UY9Co` | ≡ opens the menu sheet with the AKUN group |
| M3 · Language sheet · phone · light | `X9JQT` | *Bahasa* row opens the language options |
| M4 · Theme sheet · phone · light | `cCf8E` | *Tema* row opens the theme options |
| D3 · Language switching (pending) · desktop · light | `PuQxH` | Language items disabled; the chosen one shows a spinner and *Mengganti bahasa…* |
| D4 · Language switch failed · desktop · light | `y49rBj` | Toast/Danger bottom-right: *Bahasa belum diganti. Coba lagi.* |
| M5 · Language switching (pending) · phone · light | `ZJyUC` | Sheet meta *Mengganti bahasa…*, options dimmed, spinner on the chosen one |
| M6 · Language switch failed · phone · light | `p2jPCo` | Toast/Danger top-centre with the same message |

## Account menu

The language switch lives in the owner's account menu, not in a segmented control.

- **Desktop (D2):** the account block at the bottom of the sidebar is the trigger (icon `chevrons-up-down` replaces `log-out`). Menu: Profil, Pengaturan, BAHASA (English, Bahasa Indonesia ✓), TEMA (Terang, Gelap, Sistem ✓), Keluar. Language and theme are chosen in the menu with one click. The sidebar *Pengaturan* nav item is hidden in this frame because the menu holds it.
- **Phone (M2–M4):** ≡ opens Bottom Sheet/Menu. A new AKUN group holds Profil, Pengaturan, *Bahasa · Bahasa Indonesia ›*, *Tema · Sistem ›* and Keluar (destructive). The account footer's log-out button is off. *Bahasa* and *Tema* open a Bottom Sheet/Actions with the options and a check on the current one.
- Option labels use self-names (deck §1).

## Scope note (Owner, 2026-10-11)

The whole menu is shown in this phase. Only **Bahasa** works in F-22, because F-22 is the copy and language feature. The other actions are built in the next phase:

- **Bahasa (F-22):** the switch writes the owner's locale (`setOwnerLocale`) and refreshes the page, with pending and failed states (deck §1).
- **Tema** (Terang / Gelap / Sistem), next phase: no theme switching exists yet, and it is not in the F-22 spec or copy deck. The labels *Tema, Terang, Gelap, Sistem* are proposed copy, not deck copy.
- **Profil**, **Pengaturan**, **Keluar**, next phase: entry points only; the destinations and sign-out flow already exist and are wired then.
- Open question for the next phase: whether the sidebar *Pengaturan* nav item is removed for good.

## State inventory (C-007)

| State | Frame | AC |
|---|---|---|
| Menu closed | `x7qwr`, `v8vSQJ` | AC-L10N-001 |
| Menu open | `TJlEh`, `UY9Co` | AC-L10N-001, AC-L10N-002 |
| Language options (inline in the desktop menu) | `X9JQT` | AC-L10N-001 |
| Theme options (inline in the desktop menu) | `cCf8E` | next phase |
| Language switching (pending) | `PuQxH`, `ZJyUC` | AC-L10N-004 |
| Language switch failed | `y49rBj`, `p2jPCo` | AC-L10N-004 |

Copy is verbatim from deck §1 (*Mengganti bahasa…*, *Bahasa belum diganti. Coba lagi.*). The failure toast has no *Coba lagi* action button, because the deck sentence already says it and the owner retries by choosing the language again; the menu keeps the old language checked.

## Token and component dependencies

- Components: App Shell `a:y9uBJl`, Mobile App Shell `a:c6qPz7`, Menu `a:g6dKmz`, Menu Item Default/Selected/Destructive, Menu Divider, Menu Group Label, Bottom Sheet/Menu `a:oWJw2`, Bottom Sheet/Actions `a:U0wHw`, Sheet Item Default/Destructive, Nav Group Label.
- Tokens: semantic surface/text/border tokens and `component/modal/scrim` for the sheet scrim.

## Token-usage rule exceptions

- None in the new frames. The scrim rectangles (390 × 844) and the menu position are canvas-only sizes.

## Open items

1. **APPROVED:** Owner, 2026-10-11 ("sudah saya save, desain disetujui"). The design is `DESIGNED`.
2. HTML exports (2026-10-11, `html-tailwind`, exported through Pencil MCP): 10 frames in [`exports/`](exports/), indexed in [`exports/INDEX.md`](exports/INDEX.md). Phone frames use the device name `mobile`; the M2 menu sheet is the `account-menu-open` mobile state.
3. After every re-export of the HTML frames to `docs/features/bilingual-copy-revamp/exports/`, run `python3 scripts/sdv/index-exports.py bilingual-copy-revamp`.
