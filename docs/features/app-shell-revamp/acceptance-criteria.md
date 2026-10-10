# Acceptance Criteria — App Shell revamp (F-17)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (S-An) point to [spec.md](spec.md#assumptions-low-risk-reversible). Visual fidelity is checked against the approved Pencil exports from `/sdv:design-feature app-shell-revamp`.

## Layout

## AC-SHELL-001 — Desktop shell
Covers: BR-WS-003, C-008 (S-A1, S-A2, S-A3)

**Given** an Owner inside workspace A at a width ≥ 1280 px
**When** they open any owner page
**Then** the page renders with:
- the Sidebar, which shows the logo row with collapse, A's name in the switcher (no decorative mark), the full F-02 navigation in F-02 order, and the Account block;
- the App Panel, whose Page Header has a breadcrumb (`A` › the page's nav label) and a hero with the page's single `<h1>`;
- the content canvas, with its Container at most 1096 px and centred.

The breadcrumb bar ends with the Search and Notifications icon buttons (S-A2).

## AC-SHELL-002 — Desktop collapse is remembered per browser
Covers: C-007 (F-02 A-8)

**Given** an Owner at ≥ 1280 px who collapses the Sidebar to the rail
**When** they reload, open another owner page, or switch workspace in the same browser
**Then** the rail stays collapsed until they expand it. A different browser, or one with storage unavailable, starts expanded.

## AC-SHELL-003 — Tablet rail and overlay
Covers: C-008

**Given** an Owner at 768–1279 px
**When** any owner page opens
**Then** the 72 px rail shows every destination in F-02 order, the Page Header matches desktop, and activating the logo or expand control opens the full Sidebar as an overlay above the panel, without moving the panel. Esc, a scrim click or choosing a destination closes it, and focus returns to the control that opened it.

## AC-SHELL-004 — Phone top-level header and Bottom Nav
Covers: BR-WS-003, C-008 (S-A2, S-A3)

**Given** an Owner inside workspace A below 768 px
**When** they open a top-level page (e.g. Dasbor or Pengaturan)
**Then**:
- the header shows a switcher pill with A's name, then the page `<h1>` and the optional subtitle;
- content renders in the content sheet;
- the Bottom Nav shows Dasbor · Proyek · **+** · Klien · Invoice and is fixed at the bottom;
- the header shows the Search, Notifications (S-A2) and Menu icon buttons, in that order, on the right.

## AC-SHELL-005 — Phone sub-page compact bar
Covers: C-008 (S-A3)

**Given** a page declared as a sub-page of a top-level destination P
**When** it renders below 768 px
**Then**:
- it shows the compact bar: a Back button labelled *Kembali*, the title as `<h1>`, P's label as a caption, and an Actions slot that is empty unless the page supplies one action;
- no switcher pill and no Menu button;
- the Bottom Nav with P's tab active, or no tab active when P is a menu-sheet destination (S-A4).

Activating Back navigates to P's route even when the page was opened directly (not from P).

## Navigation

## AC-SHELL-006 — Active navigation
Covers: C-008 (S-A4)

**Given** an Owner on any owner route, including a *Segera hadir* destination and Workspace settings
**When** the shell renders at any width
**Then** exactly one matching destination carries `aria-current="page"` in the Sidebar or rail.
- On phones, the matching Bottom Nav tab is active (Dasbor, Proyek, Klien or Invoice). For Layanan, Tim, Template pesan, Sumber klien or Pengaturan, no tab is active.
- On Profile, no destination is active.

## AC-SHELL-007 — Menu sheet from the header
Covers: BR-WS-007, C-008

**Given** an Owner below 768 px
**When** they activate the header **Menu** button (accessible name *Menu*) on a top-level page
**Then** a sheet opens with:
- the logo row and a *Tutup* button;
- KATALOG (Layanan, Tim), Template pesan, Sumber klien, Pengaturan. Invoice is not listed; it is a Bottom Nav tab;
- the Account row (linking to Profile) and *Keluar*.

It has no workspace switcher and no archive or delete action. Choosing an item navigates and closes the sheet. While the sheet is open, content and the Bottom Nav are `inert`. Closing it returns focus to the Menu button.

## AC-SHELL-008 — Bottom Nav CTA
Covers: C-007 (F-02 AC-WS-025)

**Given** an Owner below 768 px
**When** they activate the **+** CTA (accessible name *Proyek baru*)
**Then** the new-project destination opens: while F-05 is unbuilt, that is the Proyek *Segera hadir* page with Proyek active. No menu or sheet opens.

## AC-SHELL-013 — Search and Notifications entry points
Covers: BR-WS-003, C-007 (S-A2)

**Given** an Owner inside workspace A, on desktop, tablet, or a phone top-level page
**When** they activate Search (*Cari*) or Notifications (*Notifikasi*)
**Then** the *Segera hadir* page opens inside the shell for that entry:
- the breadcrumb (or phone title) reads *Pencarian* or *Notifikasi*;
- no nav item is active;
- the workspace is still verified;
- no data is read or written.

When the unread count is 0, which is always the case until a notification feature exists, the Notifications button shows no badge. When it is > 0, the button shows the danger count badge and its accessible name includes the count.

## Workspace switching

## AC-SHELL-009 — Switcher on every layout
Covers: BR-WS-002, BR-WS-003, BR-WS-006, ADR-015

**Given** an Owner inside workspace A who also owns B
**When** they open the switcher from:
- the Sidebar (desktop), where it opens a Menu;
- the rail (tablet), where it opens a Menu;
- the header pill (phone), where it opens a bottom sheet;

**Then**:
- the list shows the same content on every layout: *Pindah workspace*, then their workspaces alphabetically, separated by dividers and without decorative icons, with A marked current by a check, then a primary *Buat workspace* button;
- choosing B sends the F-02 switch POST, which verifies and touches B, and lands on B's Dashboard with B in the switcher and breadcrumb;
- while the switch runs, the list is disabled;
- if it fails, A stays active and a danger Toast shows *Gagal pindah workspace* with **Coba lagi**, which re-sends the switch. The Toast is bottom-right on desktop and tablet, and top-centre with full width and side margins on phones. It does not make the page inert.

## AC-SHELL-010 — Foreign or unknown workspace
Covers: BR-WS-002, BR-WS-003, C-101

**Given** Owner X
**When** X opens `/w/<id>/...` for a workspace owned by Owner Y, or for a nonexistent ID, or posts a switch to it
**Then** X gets the same *not found* result in both cases:
- the shell shows no name, navigation state or data from Y's workspace;
- X's last-opened workspace is unchanged.

## AC-SHELL-014 — Separate Modal/Sheet and Toast layers
Covers: C-007, C-008

**Given** an Owner inside a workspace on any layout
**When** they choose *Buat workspace* in the switcher
**Then**:
- F-02's create form opens in the shell's Modal layer: Modal/SM on desktop and tablet, Bottom Sheet/Form on phones. While it is open, the rest of the page is `inert`;
- a Toast raised meanwhile appears in the separate Toast layer (bottom-right on desktop and tablet, top-centre on phones) without closing the Modal or Sheet and without making anything inert.

## Responsive & accessibility

## AC-SHELL-011 — Responsive transitions
Covers: BR-WS-003, C-007

**Given** an Owner on `/w/A/<page>` with the tablet overlay, menu sheet, switcher Menu or switcher sheet open
**When** the viewport crosses 768 px or 1280 px in either direction
**Then**:
- the layout switches to the one for the new width without a reload;
- the URL, active workspace and active destination are unchanged;
- overlays and sheets that belong to the previous layout close;
- keyboard focus lands on a visible element of the page;
- the desktop collapse preference applies again when ≥ 1280 px.

## AC-SHELL-012 — Shell accessibility
Covers: C-008

**Given** any owner page at desktop, tablet or phone width, in light or dark theme
**When** it is used with the keyboard and a screen reader
**Then**:
- *Langsung ke konten* is the first focusable element and moves focus to `<main>`;
- navigation is `<nav aria-label="Utama">`;
- the breadcrumb is `<nav aria-label="Breadcrumb">`, with its Current item `aria-current="page"`;
- the switcher is a button with `aria-haspopup` whose Menu or sheet is keyboard-operable and closes on Esc;
- icon-only controls have Indonesian `aria-label`s (*Ciutkan sidebar*, *Buka sidebar*, *Keluar*, *Kembali*, *Tutup*, *Cari*, *Notifikasi*, *Menu*);
- targets are at least 24 × 24 px;
- axe reports no WCAG 2.1 AA violations.
