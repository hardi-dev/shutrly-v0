# Acceptance Criteria — Service catalog (F-05)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Seeding

## AC-CAT-001 — New workspace gets the seeded item definitions
Covers: BR-CAT-011, ADR-016

**Given** a verified Owner
**When** they create a workspace
**Then** it has exactly four active definitions: *Foto edit* (`NUMBER`, *foto*, `EDIT`), *Foto cetak* (`NUMBER`, *lembar*, `PRINT`), *Jumlah orang* (`RANGE`, *orang*), *Durasi pemotretan* (`NUMBER`, *jam*), and no categories or services. If creating the workspace fails, none of them exist.

## AC-CAT-002 — Existing workspaces are backfilled
Covers: BR-CAT-011

**Given** workspaces created before F-05, one of which already has a definition named *foto edit*
**When** the F-05 migration is applied
**Then** every workspace has the four seeded names exactly once (the existing *foto edit* is kept, not duplicated), and applying it again changes nothing.

## Navigation and lists

## AC-CAT-003 — Layanan page with tabs
Covers: BR-WS-003 (A-1)

**Given** an Owner in their workspace
**When** they open *Layanan* from the sidebar, rail or phone menu
**Then** `/w/[workspaceId]/services` shows the tabs *Layanan*, *Kategori*, *Item paket*; the nav item *Layanan* is active and no *Segera hadir* placeholder is shown.

## AC-CAT-004 — Empty service list
Covers: A-6

**Given** a workspace with no categories and no services
**When** the Owner opens the *Layanan* tab
**Then** an empty state explains that services need a category and offers *Tambah layanan*, whose dialog lets them create a category inline.

## AC-CAT-005 — Lists show archived records last
Covers: BR-CAT-008 (A-8)

**Given** services *Wisuda Basic* (active), *Wisuda Lama* (archived) and *Wisuda Plus* (active) in category *Wisuda*
**When** the Owner opens the *Layanan* tab
**Then** under *Wisuda* they see *Wisuda Basic*, *Wisuda Plus*, then *Wisuda Lama* marked *Diarsipkan*, each with its price as *Rp 750.000* and an item summary. The *Kategori* and *Item paket* tabs order rows the same way.

## Item definitions

## AC-CAT-006 — Add a number definition
Covers: BR-CAT-001, BR-CAT-009 (A-4)

**Given** the *Item paket* tab
**When** the Owner adds *Album*, *Angka*, unit *buah*, selection off
**Then** it is saved active with no selection type, a toast confirms, and it appears in the list.

## AC-CAT-007 — Selection definition rules
Covers: BR-CAT-002, BR-CAT-007

**Given** the *Tambah item* form
**When** the Owner turns on *Dipakai untuk pilihan foto klien*
**Then** the value type is fixed to *Angka* and a selection type (*Foto edit* or *Foto cetak*) is required. A request that sends `RANGE` with selection, selection without a type, or a type other than `EDIT`/`PRINT` is rejected by the server and nothing is saved.

## AC-CAT-008 — Used definition keeps its type
Covers: BR-CAT-010

**Given** *Foto edit* is used by a service
**When** the Owner edits it
**Then** they can change the name and unit; value type and selection settings are read-only with an explanation, and a request changing them is rejected by the server.

## Categories

## AC-CAT-009 — Add and rename a category
Covers: BR-CAT-009

**Given** the *Kategori* tab
**When** the Owner adds *Wisuda*, then renames it *Wisuda & Kelulusan*
**Then** both saves succeed with a toast, and services in it show the new name.

## Services

## AC-CAT-010 — Create a service
Covers: BR-CUR-001, BR-CUR-003, BR-CAT-009 (A-2, A-6, A-7)

**Given** an active category *Wisuda*
**When** the Owner creates *Wisuda Basic*, category *Wisuda*, price *750000*
**Then** it is saved active with base price exactly 750000 and currency `IDR`, and the service detail page opens with empty *Item paket* and *Field booking* sections.

## AC-CAT-011 — Attach items with typed values
Covers: BR-CAT-001, BR-CAT-002, BR-CAT-005

**Given** service *Wisuda Basic*
**When** the Owner adds *Foto edit* = 25, *Foto cetak* = 5 and *Jumlah orang* = 1–2
**Then** the section lists them in that order as *25 foto*, *5 lembar*, *1–2 orang*. The definition picker no longer offers those three, nor archived definitions.

## AC-CAT-012 — Invalid item values are rejected
Covers: BR-CAT-001, BR-CAT-002

**Given** the service item form
**When** the Owner enters *Foto edit* = 2.5, or *Jumlah orang* min 3 max 2, or any negative value
**Then** a field error is shown, nothing is saved, and the server rejects the same values sent directly.

## AC-CAT-013 — One item per definition, enforced by the database
Covers: BR-CAT-005 (A-10)

**Given** two tabs both adding *Foto edit* to *Wisuda Basic*
**When** both save
**Then** exactly one succeeds; the other shows an error and the service has one *Foto edit* item.

## AC-CAT-014 — Booking fields
Covers: BR-CAT-006 (A-3)

**Given** service *Wisuda Basic*
**When** the Owner adds *Nama kampus* (*Teks*, required), *Tanggal wisuda* (*Tanggal*, required) and *Ukuran toga* (*Pilihan*: S, M, L, optional), then renames *Nama kampus* to *Kampus*
**Then** the three fields are listed in order with type and required marker; each has a key unique in the service, and the renamed field keeps its original key.

## AC-CAT-015 — Booking field validation
Covers: BR-CAT-006, BR-CAT-009 (A-3)

**Given** the booking field form
**When** the Owner saves a second field named *nama KAMPUS*, a *Pilihan* field with no options, or options *S* and *s*
**Then** each shows a field error and nothing is saved.

## AC-CAT-016 — Reorder and remove
Covers: BR-CAT-003 (A-5)

**Given** a service with items *Foto edit*, *Foto cetak* and fields *Kampus*, *Tanggal wisuda*
**When** the Owner moves *Foto cetak* up, moves *Tanggal wisuda* up, then removes *Kampus* after confirming
**Then** the new order is stored and shown after reload, and *Kampus* is gone.

## Lifecycle

## AC-CAT-017 — Archive and unarchive
Covers: BR-CAT-008

**Given** an active definition *Album*, category *Wisuda* and service *Wisuda Basic*
**When** the Owner archives each
**Then** each takes effect without confirmation, shows *Diarsipkan*, and a toast offers *Batalkan*, which restores it. While archived: *Album* is not offered when adding a service item but stays on services that use it; *Wisuda* is not offered in the category picker but its services keep it; *Wisuda Basic* shows an archived banner with *Aktifkan* on its detail page.

## AC-CAT-018 — Delete only when unreferenced
Covers: BR-CAT-004, BR-CAT-008

**Given** category *Wisuda* with service *Wisuda Basic*, which uses definition *Album*, and an unused category *Prewedding*
**When** the Owner deletes *Prewedding*, then tries to delete *Wisuda* and *Album*
**Then** *Prewedding* is deleted after confirmation; deleting *Wisuda* or *Album* is blocked with an explanation and an *Arsipkan* option, and nothing is deleted. The server enforces the same check.

## AC-CAT-019 — Duplicate names
Covers: BR-CAT-009 (A-10, A-11)

**Given** an archived definition *Album* and a service *Wisuda Basic*
**When** the Owner adds a definition *album* or a service *WISUDA BASIC*, including from two tabs at once
**Then** the save fails with *Nama ini sudah dipakai*; the same name is allowed for a category, a definition and a service because they are different kinds.

## AC-CAT-020 — Changes affect only the future
Covers: BR-CAT-003

**Given** a service whose items, fields and price are edited
**When** the edits are saved
**Then** only the service template changes; nothing else is written (F-07 snapshots will be checked in F-07).

## Security, isolation and states

## AC-CAT-021 — Workspace isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner with workspaces A and B, and another Owner's workspace C
**When** they open or change a catalog record of C, or send a request in A that refers to a category, definition or service of B
**Then** the request returns *not found* or is rejected, and no data from B or C is read or changed.

## AC-CAT-022 — Server errors keep the input
Covers: C-007

**Given** any catalog form
**When** the save fails unexpectedly
**Then** a danger toast with *Coba lagi* appears, the form keeps the entered values, and stored data is unchanged.

## AC-CAT-023 — Accessible and responsive
Covers: C-007, C-008

**Given** the *Layanan* tabs, the service detail page and every dialog
**When** checked at desktop, tablet and phone widths, light and dark
**Then** they match the approved Pencil exports, are fully keyboard operable, and pass axe with no serious or critical violations.
