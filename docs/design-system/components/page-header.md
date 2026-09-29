# Component: `Page Header`

## Status and approval

- Lifecycle: `APPROVED` 2026-09-28 (Owner: "ya" — shell v3 rules)
- Pencil library: `design-system.lib.pen` › **C40 — Page header** (`Re3nY`)
- Evidence: approved H4d desktop shell in `exploration.pen`

## Purpose

Introduces an Owner page with navigation context and a clear hero hierarchy. It replaces the legacy single-row App Panel header.

## Anatomy (`ImEDW`)

| Part | Layer | Contract |
|---|---|---|
| Breadcrumb bar | `rvmSQ` | 52 px high; `page-header.background`; bottom `page-header.border`; horizontal padding 40 and gap 8. |
| Parent | `EPpbd` | body-sm/500, `page-header.breadcrumb.text`. |
| Current | `Hh5tj` | body-sm/600, `page-header.breadcrumb.current`. |
| Hero | `bdFTT` | Padding 20 / 40 / 24; title block and Actions separated with `page-header.hero.gap`. |
| Title | `HsrFT` | display 34/700, `page-header.title`; the page `<h1>`. |
| Subtitle | `i8XPWU` | body 14, `page-header.subtitle`; one concise sentence. |
| Actions | `U9JxE` | Slot for page-level Button or Icon Button; one primary action maximum. |

## Rules

- Breadcrumbs communicate hierarchy, not browser history. Use one Parent and one Current item in the current product scope.
- Keep the subtitle to one line on desktop; omit it when it merely repeats the title.
- Page Header is flat inside App Panel: do not add radius or elevation.

## Accessibility

- Render breadcrumbs in `<nav aria-label="Breadcrumb">` with the Current item carrying `aria-current="page"`.
- The Title is the only page `<h1>`. Actions follow the heading in DOM and tab order.

## F-17 update — PROMOTED 2026-09-29

Promoted to `design-system.lib.pen` by `/sdv:save-design-system` (F-17, Owner-approved design; rules v3.1). Library (`ImEDW`): breadcrumb bar `rvmSQ` + Spacer `j3A5m` + **Utilities** slot `u6PNZ` (Icon Button Ghost MD: Cari, Notifikasi). Details: [F-17 design.md](../../features/app-shell-revamp/design.md).

- The breadcrumb bar gets an optional **Utilities** slot at its end (Icon Button Ghost MD: Cari, Notifikasi). Its right inset is `panel.app.header.padding-x`.

## Implementation references

- Tokens: `component.page-header.*`
- Nested by App Panel (`UmVJD/MST3f`)
