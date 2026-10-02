# F-06 Clients — design

- Pencil file: [clients.pen](clients.pen). It imports `design-system.lib.pen` with the prefix `Y:`; the library link is live (597 variables, every library component, including the F-05 promotion merged from `feat/catalog` `2dc3da6` and the F-06 `surface.panel-subtle` table header).
- Rules: `docs/design-system/token-usage.md` v3.1 (APPROVED).
- Direction: the F-04 structure (App Shell C30 / Mobile App Shell C35, Page Header C40, Section Card C43, List Card Item/Two-line), with the library **Table** for the desktop list. The table sits in the centred 720 column (`size.content-narrow`), like F-05 (Owner 2026-10-02: "samakan dengan catalog"); this is a deliberate exception to token-usage §4.5, which puts tables in the full container.
- Tabs (Owner 2026-10-02: same tabs as F-05 `catalog.pen`): *Aktif · Arsip* are page-level views, drawn as **C45 underline tabs in the Page Header** (Tabs row `Iu4gK` on, as Page Header/Tabs) on desktop, and as **Segmented Control/Full width** (`iIcai`), the first item in the content, on phones.
- Status: **APPROVED 2026-10-02** (Owner). 37 HTML exports in [`exports/`](exports/), one per frame (`<state>-<device>-<frameId>.html`, html-tailwind).

## Frames

Desktop frames are 1440 × 1024 (rows at y 0 / 1300 / 3900 / 5200). Phone list frames are 390 wide at y 2600; phone overlay frames are 390 × 844 at y 6500.

| State | Desktop | Phone |
|---|---|---|
| List / Populated (*Aktif*, 8 clients, more pages) — AC-CLI-001, 005, 021 | `UiKLP` | `M4s8Ln` |
| List / Row menu open — AC-CLI-016 | `uTkvt` (Action Menu) | `cVBpx` (Bottom Sheet/Actions) |
| List / Archived filter with *Pulihkan* — AC-CLI-002 | `sfgdK` (menu open) | `KHHeQ` |
| List / Empty *Aktif* — AC-CLI-003 | `VRacP` | `onzhv` |
| List / Empty *Arsip* — AC-CLI-003 | `kdPPO` | `t6bMn` |
| List / No search match — AC-CLI-004 | `H6dpp3` | `jc8Al` |
| List / Loading | `GBPbh` | `DP344` |
| List / Loading more — AC-CLI-005 | `n8bqd` | `ztbVD` |
| Add / Default (one empty Instagram row) — AC-CLI-006 | `L4hww4` (Modal/MD) | `JQzjy` (Bottom Sheet/Form, full height) |
| Edit / Several rows — AC-CLI-012 | `IGbYB` | `l3rBdN` |
| Add / Field errors (name, number, duplicate row) — AC-CLI-008, 009, 011 | `cOct2` | `LddVM` |
| Add / Number taken — AC-CLI-010 | `o6vrQ` (active: *Rina*) | `E8rum` (archived: *Budi (diarsipkan)*) |
| Add / Saving | `UBslj` | `mb5al` |
| Delete confirm — AC-CLI-014 | `wMTsk` (Modal/SM, Danger) | `C7MJQ` (Bottom Sheet/Actions) |
| Delete / Deleting | `v8owZB` | — (sheet closes; result toast) |
| Delete / Blocked (has projects) — AC-CLI-015 | `l5w2s3` | `RPieW` |
| Toast / Added | `PdmEI` | `mERwg` |
| Toast / Archived with *Batalkan* — AC-CLI-013 | `c8Kyy` | `SBrKO` |
| Toast / Server error with *Coba lagi* — AC-CLI-017 | `d0WR8o` | `o5ktK6` |

Saved, restored and deleted toasts reuse the *Added* pattern (Toast/Success) with the copy below; they are not drawn separately.

## Layout

- **Page, desktop:**
  - App Shell, with *Klien* (`users`) active in the Sidebar.
  - Page Header: Aster Wedding › Klien, a subtitle, the hero action *Tambah klien* (Button Primary, `plus`), and the underline tabs *Aktif* / *Arsip* (Tab/Active `WbyBE` + Tab/Default `M43F7D`; *Arsip* is active in the archived frames).
  - Content: the Container is 720 wide (`size.content-narrow`), centred in Page Content, as in F-05.
- **Klien table (desktop):** library Table.
  - Toolbar, laid out like a Section Card header (Owner 2026-10-02): the Title group on the left, with title *Daftar klien* (not the page title *Klien*) and the count as subtitle (*38 klien aktif*, *1 klien diarsipkan*, *0 klien aktif* / *0 klien diarsipkan* when empty; hidden while loading). The search field is on the right (320, *Cari nama atau nomor WhatsApp*, no shortcut). The Table's Segmented filter slot holds the search because the tabs live in the Page Header.
  - Columns: KLIEN (Table Cell/Client: initials avatar + name, fills the rest, about 224), WHATSAPP (184, so *Belum ada nomor WhatsApp* stays on one line), MEDIA SOSIAL (240: `<Platform> · <handle or URL>`, first link only, truncated with an ellipsis in code), actions (Table Cell/Actions, 32).
  - No number: *Belum ada nomor WhatsApp* in `text.muted`; no social link: `—` in `text.muted`.
  - Footer: centred Button Secondary *Muat lebih banyak*; hidden when everything is shown. While loading the next page it uses the pending state (*Memuat…*).
  - Empty, archived-empty and no-match states put Table Empty State in the rows slot and hide the header row and footer.
  - Loading: five Table Row/Skeleton rows with the column widths above.
- **Phone:**
  - Mobile App Shell with the Bottom Nav tab *Klien* active (A-1: Klien is a Bottom Nav destination).
  - Controls above the list: Segmented Control/Full width *Aktif* / *Arsip* first (items share the width, centred labels; as F-05), then the search field (full width).
  - Section Card Compact/Flush *Daftar klien*, with the same count as its description (hidden while loading) and *Tambah* (Button Secondary, `plus`) in its Actions slot. Rows are List Card Item/Two-line: `user` icon, name, meta `number · first link`, and Action Menu SM in the Trailing slot.
  - *Muat lebih banyak* is a full-width Button Secondary below the card.
- **Row menu:** *Ubah* (`pencil`), *Buka WhatsApp* (`message-circle`, only when the client has a number), *Arsipkan* (`archive`) or *Pulihkan* (`archive-restore`) under *Arsip*, divider, *Hapus* (destructive). Desktop draws the open menu as an absolute overlay in the content container; phones use Bottom Sheet/Actions titled with the client's name and meta.
- **Add / edit dialog:** Modal/MD on desktop; full-height Bottom Sheet/Form on phones (body scrolls, *Tambah klien* / *Simpan* pinned at the bottom, Close is the cancel).
  - *Nama klien* (Text Field), *Nomor WhatsApp (opsional)* (Text Field, helper *Contoh: 0812 3456 7890. Nomor luar negeri diawali + dan kode negara.*).
  - *Media sosial (opsional)*: rows of Select (platform) + Text Field (handle or URL, no label) + Icon Button Ghost `x` (remove), then Button Secondary *Tambah media sosial* (disabled at 10 rows). Desktop rows are one line; phone rows stack the handle under the platform line, because a select narrow enough for one line truncates the platform name.
  - Errors use Text Field/Error on the field or on the row's handle; the message sits under it.
  - Saving: confirm button pending (*Menyimpan…*).
- **Delete:** Modal/SM with Button Danger *Hapus klien* on desktop; Bottom Sheet/Actions with Sheet Item/Destructive and *Batal* on phones. Deleting: Danger pending (*Menghapus…*). Blocked: Alert/Danger *Klien ini punya proyek. Arsipkan saja.* in the modal body, *Hapus klien* disabled and *Batal* becomes *Tutup*; on phones the sheet title carries the message and the only action is *Tutup*.

## Copy

Screen copy is drawn in Pencil. Strings beyond the spec, for Owner review:

| Where | Copy |
|---|---|
| List card title / count | *Daftar klien* · *{n} klien aktif* / *{n} klien diarsipkan* (A-10, AC-CLI-021: the total for the selected tab, not the loaded page; while searching it keeps the tab total) |
| Page subtitle (desktop / phone) | *Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.* / *Orang yang memesan sesi foto.* |
| Empty *Aktif* body | *Tambahkan orang yang memesan sesi foto, lalu pilih mereka saat membuat proyek.* |
| Empty *Arsip* body | *Klien yang kamu arsipkan muncul di sini dan bisa dipulihkan kapan saja.* |
| No match body | *Coba nama lain, atau ketik sebagian nomor WhatsApp.* |
| Dialog descriptions | Add: *Klien bisa dipilih saat membuat proyek.* · Edit: *Perubahan dipakai di proyek dan pesan berikutnya.* |
| Field errors | Name empty: *Isi nama klien.* · Name too long (not drawn): *Nama klien maksimal 100 karakter.* · Duplicate row: *Akun ini sudah ada di daftar.* · Row too long (not drawn): *Maksimal 200 karakter.* |
| Delete description | *Nama, nomor WhatsApp, dan media sosialnya dihapus permanen. Nomornya bisa dipakai klien lain.* |
| Toasts | Added: *Klien ditambahkan* / *{name} siap dipilih saat membuat proyek.* · Saved: *Perubahan disimpan* · Archived: *Klien diarsipkan* / *{name} pindah ke Arsip.* + *Batalkan* · Restored: *Klien dipulihkan* · Deleted: *Klien dihapus* · Error: *Perubahan belum tersimpan* / *Terjadi kendala di server. Data klienmu tidak berubah.* + *Coba lagi* |

## Components and tokens

- **Library (`Y:`), all linked instances:**
  - shells: App Shell `y9uBJl`, Mobile App Shell `c6qPz7`, Mobile Header `o8T8zb`, Nav Item (Active `CInVy`), Bottom Nav Item (Active `bKADv`);
  - list: **Table** `FCsTI` with Table Row/Default `r7YZY`, Table Row/Skeleton `eFemy`, Table Cell/Client `lVDvO`, /Text `f0oyj`, /Actions `C1MRI`, Table Empty State `w0HQb`; Section Card Compact/Flush `Q82mo`; List Card Item/Two-line `PV6HB` and /Last `Bf3eg`; List Card Item/Skeleton `ksPQI` / `KKvqb`; Empty State `H43gDN`;
  - tabs: Page Header tabs row `Iu4gK` with Tab/Active `WbyBE` and Tab/Default `M43F7D` (C45); Segmented Control/Full width `iIcai` (Item Active `NcbI1` / Default `AptHz`);
  - controls: search field (Input/Default `lJ39W` with the `search` icon), Text Field `HHNPk` / Error `AVpMa`, Select `Wc7hd`, Icon Button Ghost MD `qY0Em`, Action Menu SM `tgN4c` / Open `M3v1E5`, Button Primary / Secondary / Danger and their pending (Disabled + *Pending indicator*) states;
  - feedback: Alert/Danger `F3GrC5`, Toast/Success `QCuMb`, Toast/Danger `C3PCyx`;
  - overlays: Modal MD `f8ym9` / SM `cdSbf`, Bottom Sheet/Form `vSBbR` and /Actions `U0wHw`, Sheet Item Default / Destructive.
- **Local:** the *Media sosial* group (label row, social rows, add button) only. It is a composition of library instances bound to `component/input/*` and `space/*`; one consumer, so it stays local (promote if F-07's quick-create reuses it).
- **Scan of all 37 frames:** 0 raw colours; the only fully clipped nodes are intentional (the open row menu overflowing its trigger, and *Muat lebih banyak* below the fold in 844-tall phone overlays).

## Rule notes and exceptions

- G3/SP5: every component keeps its own padding and gap; screen layouts use `panel.app.content.gap`, `space/2`–`space/5` only.
- Literal sizes: container 720 (= `size.content-narrow`), search width 320, column widths 184 / 240 / 32, platform select 148 (desktop) and the phone sheet height 800. Sizes can't bind in Pencil (mapping `unsupported.size-binding`).
- **DESIGN TOKEN GAP (non-blocking):** there is no semantic link-text token. A-2 says URL social values are links; the list draws them with the table cell text token. In code, render them as anchors in the same colour with an underline on hover/focus (`rel="noopener noreferrer"`, new tab). Raise a `color.semantic.text.link` token through `/sdv:design-tokens` if more features need links.
- Phone overlay frames are 844 tall; phone list frames are taller where the content scrolls.

## Spec notes (no blocking SPEC GAP)

- **Delete blocked** offers no *Arsipkan* shortcut inside the dialog; the spec only defines the message. Adding one would be new behaviour (Owner decision).
- **Phone deleting:** Sheet Item has no pending state, so the sheet closes on confirm and the result is shown by the toast; desktop draws *Menghapus…*.
- The platform Select's open list is the library Select/Open, with options in A-2 order (*Instagram, TikTok, Facebook, YouTube, X, Lainnya*); it is not drawn separately.

## Approval

APPROVED by the Owner on 2026-10-02, after the design review:
- tabs as in F-05: C45 underline tabs in the Page Header on desktop, Segmented Control/Full width on phones (library merged from `feat/catalog` `2dc3da6`);
- the table header uses the new `surface.panel-subtle` token (option C);
- the desktop table sits in the centred 720 column, like F-05;
- the toolbar has the title *Daftar klien* with the client count (A-10, AC-CLI-021) on the left and the search on the right;
- the sample client *ade* was renamed *Ade Kurnia*.

Evidence: `clients.pen` saved by the Owner (⌘S); 37 frames, 0 raw colours, no clipped content. Exports: `exports/*.html` (37 files). Next: `/sdv:plan-feature clients`.
