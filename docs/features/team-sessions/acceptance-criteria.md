# Acceptance Criteria — Team (F-08)

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Members

## AC-TEAM-001 — Tim list
Covers: BR-TEAM-004, BR-WS-003 (A-1, A-3, A-6, A-10)

**Given** an Owner whose workspace has these members:
- *Dimas*: `6281298765432`, roles *Fotografer* and *Videografer*, rate Rp 1.500.000 per session, with one unpaid Rp 1.500.000 fee and one paid fee;
- *ayu*: role *Asisten*, no rate, no assignments;
- *Budi*: archived.

**When** they open *Tim*
**Then** *Anggota* › *Aktif* lists *ayu*, then *Dimas*, under *Daftar anggota* with *2 anggota aktif*:
- *Dimas*'s row shows `+62 812-9876-5432`, *Fotografer, Videografer*, *Rp 1.500.000 / sesi* and *Belum dibayar Rp 1.500.000*;
- *ayu*'s row shows *Belum ada tarif* and no unpaid amount.

*Budi* isn't shown, the nav item *Tim* is active, and no *Segera hadir* placeholder appears.

## AC-TEAM-002 — Archived filter and empty lists
Covers: BR-TEAM-004, C-007

**Given** the workspace from AC-TEAM-001, and a second workspace with no members
**When** the Owner selects *Arsip* in the first workspace, then opens *Tim* in the second
**Then** the first shows only *Budi*, with *Pulihkan*. The second shows *Belum ada anggota tim* with *Tambah anggota*, and its *Arsip* shows *Belum ada anggota yang diarsipkan*.

## AC-TEAM-003 — Search and paging
Covers: BR-CLI-002 (A-3)

**Given** the workspace from AC-TEAM-001, and another workspace with 65 active members
**When** the Owner searches *DIM*, then `0812 9876`, then *zzz* in the first workspace, and selects *Muat lebih banyak* twice in the second
**Then** the first two searches show only *Dimas*. *zzz* shows *Tidak ada anggota yang cocok* with *Hapus pencarian*, and the query stays in the URL. In the second workspace, 30, then 60, then 65 members appear in name order, with no duplicates or gaps.

## AC-TEAM-004 — Add a member
Covers: BR-TEAM-004, BR-TEAM-005, BR-CLI-002

**Given** an Owner on *Tim*
**When** they add *  Rina  * with `0812-3456-7890`, email `Rina@Example.com`, roles *Fotografer* and *Asisten*, and rate Rp 300.000 *per jam*
**Then** the member is stored as *Rina*, `6281234567890` and `rina@example.com`, with both roles and the rate Rp 300.000 / `HOUR`. A toast confirms, and the list shows *Rina* with *Rp 300.000 / jam*.

## AC-TEAM-005 — Member validation
Covers: BR-TEAM-004, C-004

**Given** the member dialog
**When** the Owner submits each of these:
- an empty name, or one of 101 characters;
- no WhatsApp number;
- the number `12345`;
- the email `rina@`;
- no role;
- a rate of Rp 0, or Rp 1.500,50;
- an amount without a unit.

**Then** each shows its field error (*Nomor WhatsApp wajib diisi*, *Nomor WhatsApp tidak valid*, …) and nothing is saved. The server rejects the same input when the form is bypassed.

## AC-TEAM-006 — WhatsApp number unique per workspace
Covers: BR-TEAM-004, C-003

**Given** archived member *Budi* with `6281111111111`, and a client *Budi* with the same number
**When** the Owner adds a member with `0811 1111 1111`, and two tabs save two new members with the same new number at the same time
**Then** the first is rejected with *Nomor ini sudah dipakai Budi (diarsipkan)*. The client's number doesn't conflict. Of the two tabs, exactly one save succeeds and the other shows the same field error.

## AC-TEAM-007 — Edit, archive, restore, delete
Covers: BR-TEAM-004 (A-7)

**Given** *Dimas* (with assignments) and *ayu* (none)
**When** the Owner removes *Videografer* from Dimas, archives him, undoes it from the toast, archives him again, then deletes *Dimas*, then deletes *ayu*
**Then**:
- Dimas's existing *Videografer* assignment keeps its role;
- the undo makes him active again;
- after the second archive he moves to *Arsip*;
- deleting him shows *Anggota ini punya penugasan. Arsipkan saja.* and nothing is deleted;
- *ayu* is deleted after confirmation, with a toast.

## Roles

## AC-TEAM-008 — Seeded roles
Covers: BR-TEAM-005 (A-9)

**Given** a new workspace, and a workspace from before F-08 that already has a role named *fotografer*
**When** each opens *Tim* › *Peran*
**Then** the new workspace lists *Asisten*, *Fotografer* and *Videografer*. The older workspace gains *Asisten* and *Videografer*, keeps its own *fotografer*, and has no duplicate.

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
- the first delete shows *Peran ini masih dipakai 1 anggota.* and nothing is deleted;
- *Drone* is deleted.

## AC-TEAM-010 — Create a role from the member form
Covers: BR-TEAM-005 (A-5)

**Given** the member dialog
**When** the Owner selects *Tambah peran baru*, types *MUA* and confirms
**Then** *MUA* is created in the workspace's roles and is selected for the member.

## Assignments

## AC-TEAM-011 — Assign a member to a session
Covers: BR-TEAM-001, BR-TEAM-006, BR-PRJ-006

**Given** a `BOOKED` project with sessions *Akad* and *Resepsi*, and *Dimas* (*Fotografer*, *Videografer*, Rp 1.500.000 per session)
**When** the Owner selects *Tambah anggota* under *Resepsi*, picks *Dimas*, changes the role to *Videografer* and saves
**Then**:
- the dialog first preselects *Fotografer* and prefills Rp 1.500.000;
- *Resepsi* shows *Dimas · Videografer · Rp 1.500.000 · Belum dibayar*, and a toast confirms;
- *Akad* still shows *Belum ada tim*;
- the project's status is unchanged.

## AC-TEAM-012 — Fee prefill per unit
Covers: BR-TEAM-006

**Given** a session from 07.30 to 10.10 and a session with only a date, and these members:
- *Rina*, Rp 300.000 per hour;
- *Sari*, Rp 5.000 per minute;
- *Joko*, Rp 2.000.000 per day;
- *ayu*, no rate.

**When** the Owner picks each of them in *Tambah penugasan*, on each session
**Then** the fees are prefilled as follows:

| Member | 07.30–10.10 session | Date-only session |
|---|---|---|
| *Rina* | Rp 900.000 | empty, *Isi honor secara manual* |
| *Sari* | Rp 800.000 | empty, *Isi honor secara manual* |
| *Joko* | Rp 2.000.000 | Rp 2.000.000 |
| *ayu* | empty | empty |

**And** changing the session's end time afterwards leaves the saved fees unchanged.

## AC-TEAM-013 — Assignment validation and integrity
Covers: BR-TEAM-006, BR-WS-002, C-004

**Given** *Dimas* is already on *Resepsi*, *Budi* is archived, and a session of another project or workspace exists
**When** the server receives requests to:
- add *Dimas* to *Resepsi* again;
- assign *Budi*;
- assign *Dimas* as *Asisten*, a role he doesn't have;
- save a fee of -1 or 1.5;
- assign to the other session through this project's route.

**Then** each is rejected with no change: the duplicate, archived and role cases show form errors, the fee cases show field errors, and the foreign session is *not found*. *Tambah penugasan* only offers active members who aren't on the session yet.

## AC-TEAM-014 — Edit and remove an assignment
Covers: BR-TEAM-006 (A-4)

**Given** *Dimas · Videografer · Rp 1.500.000 · Belum dibayar* on *Resepsi*
**When** the Owner changes the fee to Rp 1.750.000, then removes the assignment after confirming *Hapus Dimas dari Resepsi?*
**Then** the session shows the new fee, then *Belum ada tim*, with a toast after each.

## AC-TEAM-024 — Edit keeps archived member and removed role
Covers: BR-TEAM-006

**Given** an unpaid assignment *Dimas · Videografer · Rp 1.500.000*, after which *Dimas* was archived and *Videografer* was removed from his roles
**When** the Owner changes only the fee to Rp 1.600.000, then tries to change the role to *Asisten*, which he doesn't have
**Then** the fee change is saved with the member and role unchanged; the role change is rejected with a form error.

## AC-TEAM-025 — Payment can't race a delete
Covers: BR-TEAM-006, BR-TEAM-007, C-005

**Given** a session whose only assignment is unpaid
**When** one tab marks the fee paid while another deletes the session at the same moment
**Then** either the payment wins and the delete is blocked with *Ada honor yang sudah dibayar di sesi ini.*, or the delete wins and the payment answers *not found*. A paid assignment is never deleted.

## AC-TEAM-015 — Cancelled projects
Covers: BR-TEAM-006, BR-TEAM-007, BR-PRJ-010

**Given** a `CANCELLED` project with an unpaid assignment for *Dimas*
**When** the Owner views *Jadwal*, and a stale tab tries to add or edit an assignment
**Then**:
- the team is shown read-only, with *Tandai dibayar* as the only action;
- the stale writes are rejected with *Proyek dibatalkan; tim tidak bisa diubah.*;
- *Dimas*'s unpaid total on *Tim* still includes the fee.

## Payment

## AC-TEAM-016 — Mark a fee paid
Covers: BR-TEAM-007, BR-PRJ-006, C-005

**Given** *Dimas*'s unpaid Rp 1.500.000 assignment, on 2026-11-12
**When** the Owner selects *Tandai dibayar*, keeps the date 12 Nov 2026 and confirms
**Then**:
- the assignment shows *Dibayar · 12 Nov 2026* and stores `paidOn`, `paidAt` and `paidBy`;
- *Dimas*'s unpaid total goes down by Rp 1.500.000;
- no invoice, payment (BR-PAY-*) or project status changes.

A future date shows a field error.

## AC-TEAM-017 — A paid assignment is locked
Covers: BR-TEAM-007

**Given** a `PAID` assignment
**When** the Owner opens *Ubah*, and a stale tab tries to change its fee or remove it
**Then**:
- the form is read-only with *Batalkan pembayaran untuk mengubah.*;
- *Hapus* is disabled;
- the stale requests are rejected with *Honor sudah ditandai dibayar*, and nothing changes.

## AC-TEAM-018 — Undo a payment
Covers: BR-TEAM-007 (A-7)

**Given** a `PAID` assignment
**When** the Owner selects *Batalkan pembayaran*, then *Batalkan* in the toast
**Then** the assignment first returns to *Belum dibayar*, with its payment date cleared and the unpaid total restored. The toast's *Batalkan* then marks it paid again with the original date.

## AC-TEAM-019 — Member detail
Covers: BR-TEAM-007 (A-4)

**Given** *Dimas* with three assignments on two projects, one of them paid
**When** the Owner opens *Dimas*
**Then**:
- *Penugasan* shows the two unpaid assignments under *Belum dibayar*, newest session first, each with its project, session, date, role and fee, and links to its project;
- *Semua* also shows the paid one with its date;
- marking one paid there removes it from *Belum dibayar*.

## Sessions and projects

## AC-TEAM-020 — Deleting sessions and drafts with a team
Covers: BR-TEAM-006, BR-TEAM-003, BR-PRJ-010

**Given** a project with:
- a session *Akad* with two unpaid assignments;
- a session *Prewed* with one paid assignment;
- a draft project whose session has a paid assignment.

**When** the Owner deletes *Akad*, then *Prewed*, then the draft
**Then**:
- deleting *Akad* asks for confirmation (*Sesi ini punya 2 anggota tim. Penugasan mereka ikut terhapus.*), and deletes the session with both assignments;
- *Prewed* and the draft are blocked with *Ada honor yang sudah dibayar di sesi ini.*, and nothing is deleted.

## AC-TEAM-021 — No stored session status
Covers: BR-TEAM-002, BR-PRJ-004

**Given** a `BOOKED` project whose only session is in the past and fully staffed
**When** the Owner views it
**Then** no session status can be set, and the project stays `BOOKED` until the Owner moves it.

## Security

## AC-TEAM-022 — Tenant isolation
Covers: BR-WS-002, BR-WS-003, C-101

**Given** an Owner of workspace A, and a member, role, assignment and session that belong to workspace B
**When** they open, edit, archive, delete, assign or mark paid any of them through A's routes, or with B's IDs in the request body
**Then** every request answers *not found* and nothing in workspace B changes.

## AC-TEAM-023 — No member data in logs
Covers: C-103, C-007

**Given** any member, assignment or payment write, including one that fails
**When** the server logs it
**Then** the log has no names, WhatsApp numbers, emails or `wa.me` links. A failed save shows *Perubahan belum tersimpan* with *Coba lagi*, and the dialog keeps the input.
