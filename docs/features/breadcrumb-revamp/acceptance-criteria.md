# Acceptance Criteria — Breadcrumb revamp (F-22)

Spec: [spec.md](spec.md). Trails are checked on desktop (≥ 1280 px) unless a criterion says otherwise. `Aster` is the workspace name; `›` separates crumbs; the last crumb is the current page.

## AC-CRUMB-001 — The Dashboard is the root
Covers: BR-WS-003 (R-2)

**Given** an Owner in workspace *Aster*
**When** they open `/w/[id]`
**Then** the breadcrumb is the single crumb *Dasbor*, marked current, with no link

## AC-CRUMB-002 — Section pages hang under the workspace
Covers: BR-WS-003 (R-1, R-2, R-5)

**Given** an Owner in workspace *Aster*
**When** they open each of `/projects`, `/clients`, `/team`, `/services`, `/message-templates`, `/photo-sources`, `/settings`, `/invoices`, `/search` and `/notifications`
**Then** the breadcrumb is *Aster › {page label}* (*Proyek*, *Klien*, *Tim*, *Layanan*, *Template pesan*, *Sumber foto*, *Pengaturan*, *Invoice*, *Pencarian*, *Notifikasi*), and *Aster* links to `/w/[id]` of the same workspace

## AC-CRUMB-003 — A tab route adds one crumb
Covers: (R-4)

**Given** an Owner in workspace *Aster*
**When** they open `/projects/completed`, `/projects/cancelled`, `/clients/archived`, `/team/archived`, `/team/roles`, `/services/categories` and `/services/items`, then each section's default tab
**Then** the trails are *Aster › Proyek › Selesai*, *Aster › Proyek › Dibatalkan*, *Aster › Klien › Arsip*, *Aster › Tim › Arsip*, *Aster › Tim › Peran*, *Aster › Layanan › Kategori* and *Aster › Layanan › Item paket*, with the middle crumb linking to the section's default route; the page title stays the section name (*Proyek*, *Klien*, *Tim*) while the services tabs keep their tab title as today; on a default tab the trail is *Aster › {section}* with no tab crumb

## AC-CRUMB-004 — Project pages
Covers: BR-WS-003 (R-1, R-3)

**Given** workspace *Aster* with the project *Rina & Dimas Wedding*
**When** the Owner opens `/projects/new`, the project's detail and its gallery
**Then** the trails are *Aster › Proyek › Proyek baru*, *Aster › Proyek › Rina & Dimas Wedding* and *Aster › Proyek › Rina & Dimas Wedding › Galeri*; *Proyek* links to `/projects` and the project title links to the project's detail

## AC-CRUMB-005 — Client picks under the gallery
Covers: BR-WS-003 (R-1, R-3)

**Given** the project *Rina & Dimas Wedding* with a published gallery and the selection group *Foto edit*
**When** the Owner opens the gallery's *Pilihan klien* page and then the *Foto edit* group
**Then** the trails are *Aster › Proyek › Rina & Dimas Wedding › Galeri › Pilihan klien* and *Aster › Proyek › Rina & Dimas Wedding › Galeri › Pilihan klien › Foto edit*, and every crumb but the last links to its own route

## AC-CRUMB-006 — Service detail and template editor
Covers: BR-WS-003 (R-1, R-3)

**Given** workspace *Aster* with the service *Wedding Gold*
**When** the Owner opens the service's detail and the *Bagikan gallery* template editor
**Then** the trails are *Aster › Layanan › Wedding Gold* and *Aster › Template pesan › Bagikan gallery*

## AC-CRUMB-007 — Profile stands alone
Covers: (R-2)

**Given** an Owner whose last-opened workspace is *Aster*
**When** they open `/profile`
**Then** the breadcrumb is the single crumb *Profil*, with no workspace crumb, while the shell still shows *Aster* in the switcher

## AC-CRUMB-008 — Client trails
Covers: BR-ACC-003, BR-SEL-005 (R-1, R-3)

**Given** a client signed in to a gallery whose project has the `OPEN` group *Foto edit*, the `LOCKED` group *Foto cetak* and a published final delivery
**When** they open *Semua foto*, *Hasil akhir*, the *Foto edit* group, the *Foto edit* review, the *Foto cetak* review, and select two photos on *Hasil akhir*
**Then** the trails are *Beranda › Semua foto*, *Beranda › Hasil akhir*, *Beranda › Foto edit*, *Beranda › Foto edit › Tinjau* and *Beranda › Foto cetak › Tinjau*; on the *Foto edit* review, *Foto edit* links to its Pilih page; on the *Foto cetak* review, *Foto cetak* is plain text with no link, because its Pilih page redirects back to the review (R-5 exception); the read-only review keeps *Foto cetak* as its title; with two photos selected the title is *2 dipilih* and the trail stays *Beranda › Hasil akhir*

## AC-CRUMB-009 — Beranda always exists
Covers: BR-SEL-001 (R-7; withdraws F-10 A-31)

**Given** a published gallery whose project has no selection group and no published final delivery
**When** the client signs in, opens *Semua foto* from Beranda and selects the *Beranda* crumb
**Then** they land on Beranda showing only the *Semua foto* card; *Semua foto* shows *Beranda › Semua foto*; the crumb returns to Beranda without redirecting back; on a phone *Semua foto* shows the *Beranda* button; the *Semua foto* page title is still the project title and its subtitle is still the one for a project without groups

## AC-CRUMB-010 — Accessible trail
Covers: (R-5, C-008)

**Given** any page from AC-CRUMB-002…009
**When** the user moves through the breadcrumb with the keyboard only
**Then** the trail is a `<nav aria-label="Breadcrumb">`; every crumb but the last is a link reached by Tab and opened by Enter, except the plain-text crumb of the R-5 exception, which is not focusable; the last crumb is text with `aria-current="page"` and is not focusable; separators are hidden from assistive technology

## AC-CRUMB-011 — Complete on first paint
Covers: (R-6)

**Given** the Owner on `/projects`
**When** they open a project's gallery by client-side navigation, and separately load the gallery URL directly
**Then** in both cases the first rendered breadcrumb is already *Aster › Proyek › {judul proyek} › Galeri*: on the direct load the server HTML already contains the full trail, and on the client-side navigation no shorter trail is rendered before it

## AC-CRUMB-012 — Names stay inside the tenant and the token
Covers: BR-WS-003, BR-ACC-003, C-101, C-104

**Given** workspace *Aster* and another Owner's workspace *Bumi* with the project *Proyek Bumi*
**When** the Owner of *Aster* opens `/w/[aster]/projects/[bumi-project]/gallery`, and a client with *Aster*'s project token opens a group ID from *Bumi*
**Then** both get not-found, and no page shows *Proyek Bumi* or the other group's name in a breadcrumb

## AC-CRUMB-013 — A long trail keeps its ends
Covers: (alternative flow *Long trails*; shape per OQ-5)

**Given** a project titled with 60 characters and its selection group *Foto album keluarga besar*
**When** the Owner opens that group's picks page at 1280 px
**Then** the breadcrumb stays on one line in the bar, *Aster* and *Foto album keluarga besar* are shown in full, every crumb is still reachable by keyboard (directly or through the design's overflow control), and the page has no horizontal scroll

## AC-CRUMB-014 — Phone back goes one level up
Covers: (alternative flow *Phones*)

**Given** a phone viewport
**When** the Owner opens the gallery, the *Pilihan klien* page and a group's picks, and the client opens the review of an `OPEN` group
**Then** the back button goes to the project's detail, the gallery, *Pilihan klien* and the group's Pilih page respectively

## AC-CRUMB-015 — Sidebar toggle sits left of the breadcrumb on desktop
Covers: (scope addition, sidebar toggle; F-17 AC-SHELL-002)

**Given** an Owner at ≥ 1280 px with the expanded Sidebar
**When** they press the toggle at the left of the breadcrumb bar, then reload, then press it again
**Then** the Sidebar collapses to the 72 px rail and stays collapsed after the reload; the toggle's label and icon change to *Buka sidebar* while collapsed and back to *Ciutkan sidebar* when expanded; the logo row and the rail have no separate collapse or expand button; focus stays on the toggle after each press

## AC-CRUMB-016 — Tablet toggle opens the Sidebar overlay
Covers: (scope addition, sidebar toggle; F-17 AC-SHELL-003)

**Given** an Owner at 768–1279 px on the rail
**When** they press the toggle at the left of the breadcrumb bar, then close the overlay with Esc
**Then** the toggle's label is *Buka sidebar*; the full Sidebar opens as an overlay above the panel without moving the page; the toggle is hidden behind the scrim while it is open; after Esc the overlay closes and focus returns to the toggle; the overlay has no close control of its own; a click on the scrim or choosing a destination also closes it
