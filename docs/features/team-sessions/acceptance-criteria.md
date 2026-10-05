# Acceptance Criteria — Team (F-08)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime). IDs are stable. The money criteria were removed with the scope cut (Owner 2026-10-03, fees moved to F-18); they stay listed as removed and are never reused.

## Members

## AC-TEAM-001 — Tim list
Covers: BR-TEAM-004, BR-WS-003 (A-1, A-3)

**Given** an Owner whose workspace has *Dimas Pratama* (`6281298765432`, roles *Fotografer* and *Videografer*), *Ayu Kirana* (role *Asisten*) and *Budi* (archived)
**When** they open *Tim*
**Then**:
- *Anggota* › *Aktif* lists *Ayu Kirana*, then *Dimas Pratama*, under *Daftar anggota* with *2 anggota aktif*;
- *Dimas*'s row shows `+62 812-9876-5432` and *Fotografer, Videografer*;
- *Budi* isn't shown;
- no rate, fee or payment information appears;
- the nav item *Tim* is active, and no *Segera hadir* placeholder appears.

## AC-TEAM-002 — Archived filter and empty lists
Covers: BR-TEAM-004, C-007

**Given** the workspace from AC-TEAM-001, and a second workspace with no members
**When** the Owner selects *Arsip* in the first workspace, then opens *Tim* in the second
**Then** the first shows only *Budi*, with *Pulihkan*. The second shows *Belum ada anggota tim* with *Tambah anggota*, and its *Arsip* shows *Belum ada anggota yang diarsipkan*.

## AC-TEAM-003 — Search and paging
Covers: BR-CLI-002 (A-3)

**Given** the workspace from AC-TEAM-001, and another workspace with 65 active members
**When** the Owner searches *DIM*, then `0812 9876`, then *zzz* in the first workspace, and selects *Muat lebih banyak* twice in the second
**Then**:
- the first two searches show only *Dimas Pratama*;
- *zzz* shows *Tidak ada anggota yang cocok* with *Hapus pencarian*, and the query stays in the URL;
- in the second workspace, 30, then 60, then 65 members appear in name order, with no duplicates or gaps.

## AC-TEAM-004 — Add a member
Covers: BR-TEAM-004, BR-TEAM-005, BR-CLI-002

**Given** an Owner on *Tim*
**When** they add *  Rina  * with `0812-3456-7890`, email `Rina@Example.com`, and roles *Fotografer* and *Asisten*
**Then** the member is stored as *Rina*, `6281234567890` and `rina@example.com`, with both roles. A toast confirms, and the list shows *Rina* with *Fotografer, Asisten*.

## AC-TEAM-005 — Member validation
Covers: BR-TEAM-004, C-004

**Given** the member dialog
**When** the Owner submits each of these:
- an empty name, or a name of 101 characters;
- no WhatsApp number;
- the number `12345`;
- the email `rina@`;
- no role.

**Then** each shows its field error (*Nomor WhatsApp wajib diisi*, *Nomor WhatsApp tidak valid*, …) and nothing is saved. The server rejects the same input when the form is bypassed.

## AC-TEAM-006 — WhatsApp number unique per workspace
Covers: BR-TEAM-004, C-003

**Given** an archived member *Budi* with `6281111111111`, and a client *Budi* with the same number
**When** the Owner adds a member with `0811 1111 1111`, and two tabs save two new members with the same new number at the same time
**Then**:
- the first is rejected with *Nomor ini sudah dipakai Budi (diarsipkan)*;
- the client's number doesn't conflict;
- of the two tabs, exactly one save succeeds and the other shows the same field error.

## AC-TEAM-007 — Edit, archive, restore, delete
Covers: BR-TEAM-004 (A-7)

**Given** *Dimas Pratama* (with assignments) and *Ayu Kirana* (none)
**When** the Owner:
1. removes *Videografer* from Dimas;
2. archives him, then undoes it from the toast;
3. archives him again;
4. deletes *Dimas Pratama*;
5. deletes *Ayu Kirana*.

**Then**:
- Dimas's existing *Videografer* assignment keeps its role;
- the undo makes him active again;
- after the second archive he moves to *Arsip*;
- deleting him shows *Anggota ini punya penugasan. Arsipkan saja.* and nothing is deleted;
- *Ayu Kirana* is deleted after confirmation, with a toast.

## Roles

## AC-TEAM-008 — Seeded roles
Covers: BR-TEAM-005 (A-9)

**Given** a new workspace, and a workspace from before F-08 that already has a role named *fotografer*
**When** each opens *Tim* › *Peran*
**Then**:
- the new workspace lists *Asisten*, *Fotografer* and *Videografer*;
- the older workspace gains *Asisten* and *Videografer*, keeps its own *fotografer*, and has no duplicate.

## AC-TEAM-009 — Manage roles
Covers: BR-TEAM-005

**Given** the role *Asisten*, used by one member, and an unused role *Drone*
**When** the Owner:
1. adds *  videografer *;
2. renames *Asisten* to *Asisten fotografer*;
3. deletes *Asisten fotografer*;
4. deletes *Drone*.

**Then**:
- the add shows *Peran ini sudah ada*;
- the rename shows on the member and on their assignments;
- the first delete shows *Peran ini masih dipakai 1 anggota.*, and nothing is deleted;
- *Drone* is deleted.

## AC-TEAM-010 — Create a role from the member form
Covers: BR-TEAM-005 (A-5)

**Given** the member dialog
**When** the Owner selects *Tambah peran baru*, types *MUA* and confirms
**Then** *MUA* is created in the workspace's roles and is selected for the member.

## Assignments

## AC-TEAM-011 — Assign a member to a session
Covers: BR-TEAM-001, BR-TEAM-006, BR-PRJ-004 (A-12)

**Given** a `BOOKED` project with sessions *Akad* and *Resepsi* and no team, and *Dimas Pratama* (*Fotografer*, *Videografer*)
**When** the Owner:
1. opens ⋯ on *Resepsi*, then closes it;
2. selects the `user-plus` button on *Resepsi*;
3. picks *Dimas Pratama*, changes the role to *Videografer* and saves.

**Then**:
- the ⋯ menu offers *Tambah tim*, *Ubah sesi* and *Hapus sesi*, with no *Atur tim*;
- the `user-plus` button opens the form *Tambah anggota · Resepsi* directly, with no session field; after *Dimas* is picked it preselects *Fotografer*;
- after saving, the form closes, *Resepsi* shows his avatar instead of the `user-plus` button, and a toast confirms;
- *Resepsi*'s ⋯ menu now offers *Atur tim* instead of *Tambah tim*, while *Akad* still shows the `user-plus` button;
- the project's status is unchanged.

## ~~AC-TEAM-012 — Fee prefill per unit~~
Removed (Owner 2026-10-03): no rates or fees in F-08 (F-18).

## AC-TEAM-013 — Assignment validation and integrity
Covers: BR-TEAM-006, BR-WS-002, C-003, C-004

**Given** *Dimas Pratama* is already on *Resepsi*, *Budi* is archived, and a session of another project or workspace exists
**When** the server receives requests to:
- add *Dimas* to *Resepsi* again, including two tabs at the same time;
- assign *Budi*;
- assign *Dimas* as *Asisten*, a role he doesn't have;
- assign to the other session through this project's route.

**Then** each is rejected with no change:
- the duplicate, archived and role cases show form errors, and the database's unique index lets only one of the parallel adds through;
- the foreign session is *not found*.

The Penugasan form only offers active members who aren't on the session yet.

## AC-TEAM-014 — Remove an assignment, change a role
Covers: BR-TEAM-006 (A-4, A-12)

**Given** *Dimas Pratama* (*Videografer*) and *Sari Lestari* (*Asisten*) on *Resepsi*
**When** the Owner:
1. opens *Atur tim* from *Resepsi*'s avatar group;
2. selects the `trash-2` button on Dimas's row and confirms *Hapus Dimas dari Resepsi?*;
3. selects *Tambah anggota* and adds *Dimas Pratama* as *Fotografer* (the form returns to *Atur tim* after saving);
4. removes *Dimas*, then *Sari*.

**Then**:
- each row in *Atur tim* has a `trash-2` button in the danger colour, and there is no *Ubah penugasan*;
- after step 3, *Atur tim* shows *Sari Lestari · Asisten* and *Dimas Pratama · Fotografer*;
- removing the last member closes *Atur tim*, and *Resepsi* shows the `user-plus` button again; no empty *Atur tim* is shown;
- a toast follows each step.

## ~~AC-TEAM-024 — Edit keeps an archived member and a removed role~~
Removed (Owner 2026-10-03, design): assignments are never edited; remove and add again (BR-TEAM-006).

## AC-TEAM-015 — Cancelled projects
Covers: BR-TEAM-006, BR-PRJ-010

**Given** a `CANCELLED` project with *Dimas Pratama* on *Wisuda*
**When** the Owner views the project, and a stale tab tries to add or remove an assignment
**Then**:
- the avatar group still shows and opens *Atur tim*; a session without a team shows no `user-plus` button, and no session has a ⋯ menu;
- *Atur tim* is read-only, with no *Tambah anggota* and no `trash-2` buttons, only *Tutup*, and its note reads *Proyek dibatalkan, tim tidak bisa diubah.*;
- the stale writes are rejected with *Proyek dibatalkan; tim tidak bisa diubah.*

## ~~AC-TEAM-016 — Mark a fee paid~~
Removed (Owner 2026-10-03): no payments in F-08 (F-18).

## ~~AC-TEAM-017 — A paid assignment is locked~~
Removed (Owner 2026-10-03): no payments in F-08 (F-18).

## ~~AC-TEAM-018 — Undo a payment~~
Removed (Owner 2026-10-03): no payments in F-08 (F-18).

## ~~AC-TEAM-019 — Member detail~~
Removed (Owner 2026-10-03): there is no member detail page (A-1).

## Sessions and projects

## AC-TEAM-020 — Deleting sessions and drafts with a team
Covers: BR-TEAM-006, BR-TEAM-003, BR-PRJ-010

**Given** a project whose session *Foto keluarga* has two assignments, and a draft project whose session has one
**When** the Owner deletes *Foto keluarga*, then deletes the draft
**Then**:
- the session delete asks *Hapus sesi Foto keluarga?* with *Sesi ini punya 2 anggota tim. Penugasan mereka ikut terhapus.*, then deletes the session with both assignments;
- the *Hapus draf* confirmation adds *Penugasan tim ikut terhapus.*, then deletes the draft with its assignment;
- the members themselves stay in *Tim*.

## AC-TEAM-021 — No stored session status
Covers: BR-TEAM-002, BR-PRJ-004

**Given** a `BOOKED` project whose only session is in the past and fully staffed
**When** the Owner views it
**Then** no session or assignment status can be set, and the project stays `BOOKED` until the Owner moves it.

## ~~AC-TEAM-025 — Payment can't race a delete~~
Removed (Owner 2026-10-03): no payments in F-08 (F-18).

## AC-TEAM-026 — Avatar group and Atur tim
Covers: BR-TEAM-006 (A-4, A-12)

**Given** a `BOOKED` project where *Dimas*, *Sari*, *Joko* and *Ayu* are on *Wisuda*, in that order, and *Foto keluarga* has no team
**When** the Owner opens the project, then *Atur tim* for *Wisuda*
**Then**:
- *Wisuda* shows the avatars *DP*, *SL*, *JS* and *+1*, and *Foto keluarga* shows the `user-plus` button;
- the avatar group and ⋯ › *Atur tim* open *Atur tim*; the `user-plus` button and ⋯ › *Tambah tim* on *Foto keluarga* open the Penugasan form;
- *Atur tim* lists the four members with their roles, in that order;
- on desktop, hovering *DP* shows *Dimas Pratama · Fotografer*.

## AC-TEAM-027 — No active members
Covers: BR-TEAM-004, BR-TEAM-006, C-007

**Given** a workspace whose members are all archived, and a `BOOKED` project whose session *Wisuda* has no team
**When** the Owner selects the `user-plus` button on *Wisuda*
**Then**:
- the form *Tambah anggota · Wisuda* shows the Empty State *Belum ada anggota tim aktif* with *Tambahkan anggota di halaman Tim dulu, lalu kembali ke sini.* and *Buka Tim*, the same pattern as F-07's empty project list;
- *Tambah* is disabled;
- *Buka Tim* opens *Tim* › *Anggota*.

## AC-TEAM-028 — Staffing while creating a project
Covers: BR-TEAM-003, BR-TEAM-004, BR-TEAM-006, C-004, C-005 (Owner 2026-10-04)

**Given** the *Proyek baru* form, and active members who hold roles
**When** the Owner adds or edits a session in the *Tambah sesi* / *Ubah sesi* dialog, picks a member in *Tim* (the member's first role is preselected, and members already picked are not offered), and saves the project as a draft or as booked
**Then**:
- the session row shows the avatar group of its picks, which opens the dialog again;
- the project, its sessions and every session's assignments are saved in one transaction, so a refused team creates nothing;
- the server re-checks every pick: a member or role outside the workspace is *not found*, an archived member, a member who no longer holds the role or the same member twice in one session answers a field error *Tim sesi ini perlu diperbarui. Periksa anggota dan perannya.* and the form keeps its input;
- *Tim* is optional, and with no active members the dialog says so;
- the *Ubah sesi* dialog on a saved project has no *Tim* field: its team is changed through *Atur tim*.

## Security

## AC-TEAM-022 — Tenant isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner of workspace A, and a member, role, assignment and session that belong to workspace B
**When** they open, edit, archive, delete, assign or unassign any of them through A's routes, or with B's IDs in the request body
**Then** every request answers *not found* and nothing in workspace B changes.

## AC-TEAM-023 — No member data in logs
Covers: C-103, C-007

**Given** any member, role or assignment write, including one that fails
**When** the server logs it
**Then**:
- the log has no names, WhatsApp numbers, emails or `wa.me` links;
- a failed save shows *Perubahan belum tersimpan* with *Coba lagi*, and the dialog keeps the input.
