# Acceptance Criteria — Projects (F-07)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

Shared fixture, used unless an AC says otherwise. The Owner's workspace has:
- clients *Rina* (active) and *Budi* (archived);
- category *Wisuda* with service *Wisuda Basic* (active, 750.000 IDR):
  - items *Foto edit* 25 (`NUMBER`, *foto*, `EDIT`) and *Jumlah orang* 1–3 (`RANGE`, *orang*);
  - booking fields *Nama kampus* (*Teks*, required), *Tanggal wisuda* (*Tanggal*, required) and *Ukuran toga* (*Pilihan* S/M/L, optional);
- service *Prewed Lama* (archived).

## List

## AC-PRJ-001 — Proyek list
Covers: BR-PRJ-004, BR-WS-003 (A-1, A-4, A-5)

**Given** today is 2026-10-02 and projects *Wisuda Rina* (`BOOKED`, session *Wisuda* 2026-11-10 07.30 at *Balairung UI, Depok*), *Wisuda Sari* (`DRAFT`, no session), *Prewed Dewi* (`SHOOTING`, sessions 2026-10-20 06.00 and 2026-10-21), *Family Tono* (`COMPLETED`) and *Wisuda Andi* (`CANCELLED`)
**When** the Owner opens *Proyek*
**Then** *Aktif* shows *Prewed Dewi*, *Wisuda Rina*, *Wisuda Sari* in that order. Each row shows the title, client, service, the next session (*Sel, 10 Nov 2026 · 07.30* / *Balairung UI, Depok*; *Prewed Dewi* shows *· +1 sesi*; *Wisuda Sari* shows *Belum ada jadwal*) and status chip (*Pemotretan*, *Dibooking*, *Draf*). *Daftar proyek* shows *3 proyek aktif*. The nav item *Proyek* is active and no *Segera hadir* placeholder is shown.

## AC-PRJ-002 — Filters
Covers: BR-PRJ-004 (A-4)

**Given** the projects from AC-PRJ-001
**When** the Owner selects *Selesai*, then *Dibatalkan*
**Then** *Selesai* shows only *Family Tono*, and *Dibatalkan* shows only *Wisuda Andi*, each with its count. With several projects, *Selesai* and *Dibatalkan* list the latest session date first, and projects without a session last (A-4, A-12).

## AC-PRJ-003 — Empty lists
Covers: C-007

**Given** a workspace with no projects
**When** the Owner opens *Proyek* and selects each filter
**Then** *Aktif* shows *Belum ada proyek* with *Proyek baru*, *Selesai* shows *Belum ada proyek yang selesai*, and *Dibatalkan* shows *Belum ada proyek yang dibatalkan*.

## AC-PRJ-004 — Search
Covers: A-4

**Given** the projects from AC-PRJ-001
**When** the Owner searches *rina*, then *zzz*
**Then** *rina* shows only *Wisuda Rina* (title and client match); *zzz* shows *Tidak ada proyek yang cocok* with *Hapus pencarian*. The query stays in the URL and applies only to the selected filter.

## AC-PRJ-005 — Paging
Covers: A-4

**Given** 65 projects under *Aktif*
**When** the Owner selects *Muat lebih banyak* twice
**Then** 30, 60, then 65 projects are shown in list order with no duplicates or gaps, and *Muat lebih banyak* disappears.

## Create

## AC-PRJ-006 — Create form offers only active records
Covers: BR-CLI-003, BR-CAT-008, BR-PRJ-008

**Given** the shared fixture
**When** the Owner opens *Proyek baru* (from the list or the shell's create action)
**Then** the client picker offers *Rina* but not *Budi*. The service picker offers *Wisuda Basic* under *Wisuda* but not *Prewed Lama*. Booking fields appear only after a service is chosen.

## AC-PRJ-007 — Choosing a service prefills the form
Covers: BR-PRJ-008 (A-2)

**Given** the Owner picked *Rina* on *Proyek baru*
**When** they pick *Wisuda Basic*
**Then** these change together:
- the title becomes *Wisuda Basic — Rina*;
- the agreed price becomes 750.000;
- *Isi paket* lists *Foto edit 25 foto* and *Jumlah orang 1–3 orang*, each with *Ubah nilai* and *Hapus*, plus *Tambah item*;
- *Nama kampus*, *Tanggal wisuda* and *Ukuran toga* appear in that order, the first two marked required.

Then the Owner edits the title and picks another client. The edited title is kept.

## AC-PRJ-008 — Book a project
Covers: BR-PRJ-001, BR-PRJ-002, BR-PRJ-003, BR-PRJ-007, BR-PRJ-008, C-005

**Given** the form from AC-PRJ-007 with *Nama kampus* *UI*, *Tanggal wisuda* 2026-11-10, *Ukuran toga* empty, one session *Wisuda* on 2026-11-10 07.30–10.00 at *Balairung UI, Depok*, and price 700.000
**When** the Owner selects *Buat proyek*
**Then** one transaction does all of the following:
- creates the project in `BOOKED` with currency `IDR` and a unique token of at least 128 bits of entropy;
- creates project items *Foto edit* (`NUMBER` 25, *foto*, selection `EDIT`) and *Jumlah orang* (`RANGE` 1–3, *orang*);
- creates field values for *Nama kampus* and *Tanggal wisuda* with their key, name and type, and none for *Ukuran toga*;
- creates the session *Wisuda* with its date, times and location.

The detail page opens with a toast. The token appears in no response, page or log.

## AC-PRJ-009 — Save as draft, then confirm
Covers: BR-PRJ-002, BR-PRJ-004, BR-PRJ-008

**Given** the form from AC-PRJ-008
**When** the Owner selects *Simpan draf*, then *Konfirmasi booking* on the detail page
**Then** the project is first created in `DRAFT` with the same snapshots, then becomes `BOOKED` with a toast.

## AC-PRJ-010 — Required booking fields, also for drafts
Covers: BR-PRJ-002 (A-3)

**Given** the form from AC-PRJ-007 with *Nama kampus* empty and *Ukuran toga* set to `XL` by a request that bypasses the form
**When** the Owner selects *Simpan draf* or *Buat proyek*
**Then** *Nama kampus* shows a required error and *Ukuran toga* is rejected. No project, item or field value is created.

## AC-PRJ-011 — Field validation
Covers: BR-PRJ-008, BR-CUR-003

**Given** *Proyek baru* with a service chosen
**When** the Owner submits each of these:
- an empty title, or a title of 101 characters;
- notes of 2001 characters;
- a price of -1, 10,5 or 1.000.000.000.000;
- no client;

**Then** each shows its field error and nothing is created.

## AC-PRJ-012 — Client or service became inactive
Covers: BR-CLI-003, BR-CAT-008, BR-WS-002

**Given** *Proyek baru* filled in for *Rina* and *Wisuda Basic*
**When** *Rina* is archived in another tab, and in a second run *Wisuda Basic* is archived instead, and in a third the request names a service from another workspace
**Then** the first run shows *Klien ini sudah diarsipkan*. The second shows *Layanan ini sudah tidak aktif*. The third is treated as *not found*. Nothing is created, and the form keeps its input.

## AC-PRJ-013 — Add a client while booking
Covers: BR-CLI-001, BR-CLI-002

**Given** *Proyek baru*
**When** the Owner selects *Tambah klien baru* in the client picker and saves *Sari* with `0812 3456 7891`
**Then** the client is created under F-06's rules, and *Sari* is selected in the form. The title updates if it is still the default. Cancelling the dialog changes nothing.

## AC-PRJ-014 — No active service
Covers: C-007

**Given** a workspace whose services are all archived
**When** the Owner opens *Proyek baru*
**Then** the service field shows *Belum ada layanan aktif* with a link to *Layanan*, and *Buat proyek* and *Simpan draf* can't complete.

## Detail and deal

## AC-PRJ-015 — Project detail
Covers: BR-PRJ-001, BR-PRJ-004 (A-1, A-5)

**Given** the project from AC-PRJ-008
**When** the Owner opens it
**Then** the page shows:
- the header: title, status *Dibooking*, *Rina* and 10 Nov 2026;
- *Mulai pemotretan* as the next step;
- the info: service *Wisuda Basic*, price Rp 700.000 and notes;
- the snapshotted items and booking values, with *Ukuran toga* shown as empty;
- *Batalkan proyek* in the menu.

## AC-PRJ-016 — Snapshots ignore later catalog changes
Covers: BR-PRJ-001, BR-CAT-003, C-102

**Given** the project from AC-PRJ-008
**When** the Owner changes *Wisuda Basic* in the catalog: *Foto edit* to 40, *Nama kampus* renamed to *Kampus*, a new booking field, price 900.000; and archives the service
**Then** the project still shows *Foto edit* 25, *Nama kampus*, no new field and price Rp 700.000.

## AC-PRJ-017 — Edit the deal while `DRAFT` or `BOOKED`
Covers: BR-PRJ-009, BR-CAT-001, BR-CAT-002

**Given** the project from AC-PRJ-008 (`BOOKED`)
**When** the Owner makes these changes:
- the price becomes 800.000;
- *Foto edit* becomes 30;
- *Jumlah orang* is removed;
- *Foto cetak* (`PRINT`) is added with 10;
- *Ukuran toga* is set to M;

**Then** each change is saved with a toast:
- the added item copies the definition's current name, unit and selection type and goes last;
- the field keeps its snapshotted name, type and options;
- *Wisuda Basic* is unchanged.

The following are rejected with field errors:
- *Foto edit* 2,5;
- *Jumlah orang* min 3, max 1;
- adding *Foto edit* again (*Item ini sudah ada di proyek*);
- adding an archived definition.

## AC-PRJ-018 — Deal is read-only from `SHOOTING`
Covers: BR-PRJ-009 (A-6)

**Given** the project from AC-PRJ-008
**When** the Owner selects *Mulai pemotretan*
**Then** the status becomes *Pemotretan*. The price, item and booking-field actions are gone, while *Ubah info* still edits the title and notes, and sessions can still be added, edited and deleted. A deal edit sent directly is rejected with *Proyek sudah dalam pemotretan. Detail paket tidak bisa diubah lagi.*

## AC-PRJ-019 — Deal edit races with a status move
Covers: BR-PRJ-009, C-005 (A-9)

**Given** the project from AC-PRJ-008 open in two tabs
**When** tab 1 selects *Mulai pemotretan* and tab 2 then saves *Foto edit* 30
**Then** tab 2 shows the locked-deal error, reloads, and *Foto edit* stays 25.

## Status

## AC-PRJ-020 — Manual status steps
Covers: BR-PRJ-004

**Given** a `BOOKED` project
**When** the Owner selects *Mulai pemotretan*, then *Selesai pemotretan*
**Then** the status becomes *Pemotretan*, then *Pascaproduksi*, each with a toast. *Pascaproduksi* shows no further manual step: delivery belongs to F-12.

## AC-PRJ-021 — No stale, backward or skipped moves
Covers: BR-PRJ-004, C-004 (A-9)

**Given** a `BOOKED` project open in two tabs
**When** both select *Mulai pemotretan*
**Then** the first succeeds and the second shows *Status proyek sudah berubah* and reloads.

Requests sent directly are also rejected, each with no change:
- `SHOOTING → BOOKED`;
- `BOOKED → POST_PROCESSING`;
- any move from `CANCELLED`;
- any status sent in the body.

## AC-PRJ-022 — Cancel a project
Covers: BR-PRJ-004, BR-PRJ-010, BR-AUD-001

**Given** a `BOOKED` project and a `SHOOTING` project
**When** the Owner cancels the first without a reason, and tries the second without a reason, then with *Klien membatalkan acara*
**Then** the first becomes *Dibatalkan*, recording the actor and time. The second first shows a required-reason error, then becomes *Dibatalkan* with the reason, actor and time. Both move to *Dibatalkan*, show a banner with any reason, and become read-only. A reason over 500 characters is rejected.

## AC-PRJ-023 — Delete a draft only
Covers: BR-PRJ-010 (A-10)

**Given** a `DRAFT` project and a `BOOKED` project
**When** the Owner selects *Hapus draf* on the draft and confirms
**Then** the project, its items and field values are deleted, and the list opens with a toast. The draft's menu has no *Batalkan proyek*. The `BOOKED` project has no *Hapus draf*, and a delete request sent directly for it is rejected.

## Guards and isolation

## AC-PRJ-024 — Referenced client, service and definition can't be deleted
Covers: BR-CLI-003, BR-CAT-008, BR-CAT-004

**Given** the project from AC-PRJ-017, including the added *Foto cetak* item
**When** the Owner tries to delete *Rina*, *Wisuda Basic* and the *Foto cetak* definition
**Then** each is blocked with its existing message: *Klien ini punya proyek. Arsipkan saja.* for the client, and the F-05 in-use messages for the service and definition. The database foreign keys decide this, so the result holds even when the check races with a project creation.

Archiving each of them works and leaves the project unchanged.

## AC-PRJ-025 — Tenant isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** workspace A with a project, and an Owner of workspace B only
**When** the B Owner requests the A project's page, list, edits, status moves or delete, through B's URL or with A's ID in the body
**Then** each answers *not found* and changes nothing. A project in A can't reference a client, service or definition of B, which composite foreign keys enforce.

## AC-PRJ-026 — Accessible and responsive
Covers: C-007, C-008

**Given** the list, *Proyek baru*, detail and dialogs at desktop and phone widths
**When** they are used with the keyboard only and checked with axe
**Then** every control is reachable and labelled, and dialogs trap and return focus. Field errors are announced. Status chips have text, not color only. There are no serious axe violations.

## AC-PRJ-027 — Row menu on the list
Covers: BR-PRJ-004, BR-PRJ-010, BR-MSG-001, BR-CLI-002 (A-10)

**Given** the projects from AC-PRJ-001, where every client has a WhatsApp number except Sari's
**When** the Owner opens the ⋯ menu of each row
**Then** each menu matches the spec's row-menu table, with the step and *Ubah info* first, then the *Kirim ke klien* group, then the destructive item, each part separated by a divider:
- *Wisuda Rina* (`BOOKED`): *Mulai pemotretan*, *Ubah info*, *Chat WhatsApp*, *Batalkan proyek*;
- *Prewed Dewi* (`SHOOTING`): *Selesai pemotretan*, *Ubah info*, *Chat WhatsApp*, *Batalkan proyek*;
- *Wisuda Sari* (`DRAFT`, client without a number): *Konfirmasi booking*, *Ubah info*, *Tambah nomor WhatsApp*, *Hapus draf*;
- *Family Tono* (`COMPLETED`) and *Wisuda Andi* (`CANCELLED`): *Chat WhatsApp* only.

*Mulai pemotretan* from *Wisuda Rina*'s menu changes its chip to *Pemotretan* with a toast, and the list stays open. A stale move shows *Status proyek sudah berubah* and refreshes the list. *Chat WhatsApp* opens `https://wa.me/<number>` for the client's stored number in a new tab. *Tambah nomor WhatsApp* opens the client dialog, and after saving a number the menu shows *Chat WhatsApp*.

## AC-PRJ-028 — Filter the list
Covers: A-11

**Given** the projects from AC-PRJ-001
**When** the Owner opens *Filter proyek*, ticks *Dibooking* and *Pemotretan*, sets *Jadwal* from 1 Okt 2026 to 30 Nov 2026, and selects *Terapkan*
**Then** *Aktif* shows only *Prewed Dewi* and *Wisuda Rina*, and the filter button shows a red counter *2*. The filters stay in the URL after a reload. *Reset* clears them and removes the counter. *Sampai* before *Dari* shows a field error and applies nothing.

## AC-PRJ-029 — Sessions
Covers: BR-TEAM-002, BR-TEAM-003, BR-PRJ-004, BR-PRJ-008

**Given** *Proyek baru* filled in as in AC-PRJ-007
**When** the Owner selects *Buat proyek* with no session, then *Simpan draf* with no session
**Then** *Buat proyek* shows *Tambahkan minimal satu sesi.* and creates nothing; *Simpan draf* creates the draft without sessions. On that draft, *Konfirmasi booking* shows *Tambahkan minimal satu sesi sebelum konfirmasi booking.*, opens *Tambah sesi*, and leaves it `DRAFT`.

**And when** the Owner adds sessions in the session form
**Then** each of these is a field error and nothing is added: no name, no date, a name of 101 characters, a location of 201 characters, an end time without a start time, an end time of 07.00 with a start time of 07.30. Valid sessions are listed by date, then start time, sessions without a time first.

**And given** a `BOOKED` project with one session
**Then** that session's *Hapus* is disabled with *Proyek yang sudah dibooking butuh minimal satu sesi.*, and a delete request sent directly is rejected. With two sessions either can be deleted. A `CANCELLED` project's sessions can't be changed.

## AC-PRJ-030 — Adjust the package before saving
Covers: BR-PRJ-001, BR-PRJ-009, BR-CAT-001, BR-CAT-002

**Given** the form from AC-PRJ-007
**When** the Owner changes *Foto edit* to 30, removes *Jumlah orang*, adds *Foto cetak* 10 and selects *Buat proyek*
**Then** the project's items are *Foto edit* 30 and *Foto cetak* 10, and *Wisuda Basic* is unchanged. Invalid values are rejected with the AC-PRJ-017 errors. Picking another service afterwards asks *Ganti layanan? Perubahan isi paket akan hilang.* and, on confirm, lists the new service's items.
