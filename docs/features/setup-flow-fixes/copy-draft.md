# Setup flow fixes: copy draft (F-24, Iteration 3)

Date: 2026-10-12
Status: APPROVED (Owner, 2026-10-12, with 2 tweaks: page-not-found body, diagram folder labels)

Drafted with the Codex CLI (`codex exec --skip-git-repo-check -s read-only`, model gpt-5.6-luna) from the spec's Copy, D4, D5 and D6 sections and BR-GAL-007. Nothing here is in the `*.copy.ts` modules or `copy-deck.md` yet. Approved rows go into the deck first, then into the modules verbatim (Iteration 3.2 and 3.3).

## Proposed copy

Current strings are read from the `*.copy.ts` modules as of this draft. `pageNotFound.*` is new (D4) and has no current string.

| key | file | current EN | current ID | proposed EN | proposed ID |
|---|---|---|---|---|---|
| pageNotFound.title | new, D4 namespace (file set in 3.2) | — | — | Page not found | Halaman tidak ditemukan |
| pageNotFound.body | new, D4 namespace | — | — | This page may have been moved or removed. | Halaman ini mungkin dipindahkan atau dihapus. |
| pageNotFound.backToSection | new, D4 namespace | — | — | Back to {section} | Kembali ke {section} |
| pageNotFound.backToDashboard | new, D4 namespace | — | — | Back to dashboard | Kembali ke dasbor |
| guideStep3 | `src/features/gallery/ui/source-copy/source-copy.copy.ts` | For final delivery, add subfolders named `edited` and `print` later. | Untuk hasil akhir, tambahkan subfolder bernama `edited` dan `print` nanti. | Later, map any subfolder to a package item on the gallery page. Files in mapped subfolders are final files; unmapped photos stay available for selection. | Nanti, petakan subfolder apa pun ke item paket di halaman galeri. File di subfolder yang dipetakan menjadi hasil akhir; foto yang belum dipetakan tetap tersedia untuk dipilih. |
| treeEdited | `src/features/gallery/ui/source-copy/source-copy.copy.ts` | Edited files, added later | Hasil edit, ditambahkan nanti | Edited, mapped to Edited photos later | Hasil Edit, dipetakan ke Hasil edit nanti |
| treePrint | `src/features/gallery/ui/source-copy/source-copy.copy.ts` | Print files, added later | File cetak, ditambahkan nanti | Print, mapped to Printed photos later | Cetak, dipetakan ke Foto cetak nanti |
| sourcesEmptyBody | `src/features/gallery/ui/gallery-copy/gallery-copy.copy.ts` | Link a project folder. Photos outside `edited` and `print` folders are for selection; those named folders hold final files. | Tautkan folder proyek. Foto di luar folder `edited` dan `print` untuk pilihan klien; kedua folder itu untuk hasil akhir. | Link a project folder. Photos are for selection unless you map a subfolder to a package item; files in mapped subfolders are final files. | Tautkan folder proyek. Foto digunakan untuk pilihan kecuali subfolder dipetakan ke item paket; file di subfolder yang dipetakan menjadi hasil akhir. |
| linkDialogDescription | `src/features/gallery/ui/gallery-copy/gallery-copy.copy.ts` | Files in `edited` or `print` folders are final files. Other photos, including session subfolders, are for selection. | File di folder `edited` atau `print` adalah hasil akhir. Foto lainnya, termasuk di subfolder sesi, untuk pilihan klien. | Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files. | Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir. |
| pickModeMeta | `src/features/booking/ui/catalog-copy/catalog-copy.copy.ts` | Pilihan klien: {mode} (wrong: Indonesian in EN) | Pilihan klien: {mode} | Client choice: {mode} | Pilihan klien: {mode} (kept) |
| fieldDialogDescription | `src/features/booking/ui/catalog-copy/catalog-copy.copy.ts` | Diisi saat membuat proyek dari layanan ini. (wrong: Indonesian in EN) | Diisi saat membuat proyek dari layanan ini. | Filled in when creating a project from this service. | Diisi saat membuat proyek dari layanan ini. (kept) |

Notes for the Owner:
- `sourcesEmptyBodyMobile` ("Link the project's Google Drive folder.") does not name `edited` or `print`, so it stays as it is.
- `treeRoot` and `treeRootMeta` are not part of the draft; they name no final-folder rule.
- The `pageNotFound` body says "moved or removed". The spec says "doesn't exist or was removed"; the Owner can choose either wording.
- `treeEdited` / `treePrint` EN labels are Codex's and read a little stiffly. The ID labels use the example names "Hasil Edit" and "Cetak" from the spec.

## Final approved copy (Owner, 2026-10-12)

This is the text the Owner approved. It is copied verbatim into `copy-deck.md` and then into the `*.copy.ts` modules. The Owner's two tweaks are in these rows: the page-not-found body and the diagram folder labels.

| key | file | final EN | final ID |
|---|---|---|---|
| pageNotFound title | `page-not-found-screen.copy.ts` (new) | Page not found | Halaman tidak ditemukan |
| pageNotFound body | `page-not-found-screen.copy.ts` (new) | This page doesn't exist or was removed. | Halaman ini tidak ada atau sudah dihapus. |
| pageNotFound backToSection (`{section}`) | `page-not-found-screen.copy.ts` (new) | Back to {section} | Kembali ke {section} |
| pageNotFound backToDashboard | `page-not-found-screen.copy.ts` (new) | Back to dashboard | Kembali ke dasbor |
| guideStep3 | `source-copy.copy.ts` | Later, map any subfolder to a package item on the gallery page. Files in mapped subfolders are final files; unmapped photos stay available for selection. | Nanti, petakan subfolder apa pun ke item paket di halaman galeri. File di subfolder yang dipetakan menjadi hasil akhir; foto yang belum dipetakan tetap tersedia untuk dipilih. |
| treeEdited | `source-copy.copy.ts` | Hasil Edit → mapped to Edited photos later | Hasil Edit → dipetakan ke Hasil edit nanti |
| treePrint | `source-copy.copy.ts` | Cetak → mapped to Printed photos later | Cetak → dipetakan ke Foto cetak nanti |
| sourcesEmptyBody | `gallery-copy.copy.ts` | Link a project folder. Photos are for selection unless you map a subfolder to a package item; files in mapped subfolders are final files. | Tautkan folder proyek. Foto digunakan untuk pilihan kecuali subfolder dipetakan ke item paket; file di subfolder yang dipetakan menjadi hasil akhir. |
| linkDialogDescription | `gallery-copy.copy.ts` | Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files. | Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir. |
| pickModeMeta | `catalog-copy.copy.ts` | Client choice: {mode} | Pilihan klien: {mode} |
| fieldDialogDescription | `catalog-copy.copy.ts` | Filled in when creating a project from this service. | Diisi saat membuat proyek dari layanan ini. |

## Codex prompt

<details>
<summary>Exact prompt sent to Codex (codex-copy-prompt.md)</summary>

````text
You are drafting UI copy for Shutrly, a web app for photographers. Shutrly has two sides: a photographer (the "Owner") runs a studio admin (projects, bookings, services, galleries, photo sources), and the photographer's clients open a gallery to choose ("select") the photos they want edited. Photos live in Google Drive folders that the Owner links to Shutrly.

Write copy in English (EN) and Indonesian (ID) for exactly the keys listed in the section "Keys to draft". Return ONLY a Markdown table with the columns `key | EN | ID | note`, one row per key, and nothing else before or after the table. Use the `note` column for where the text shows and any ICU argument you kept.

## Voice and rules

- Plain, calm, direct. Sentence case. No exclamation marks. Short sentences. Address the reader as "you" in EN; in ID use the same informal-polite register as the existing ID strings (e.g. "filemu", "Anda" not used; prefer no pronoun where possible).
- Keep lengths close to the current neighbouring strings. Do not add marketing language.
- Use the deck terminology: Workspace = "Ruang kerja" (ID); Edited = "Hasil edit" (ID); Print = "Foto cetak" (ID); Proof / selection photos = "Foto pilihan" (ID); Client = "klien"; Gallery = "galeri"; project = "proyek"; service = "layanan"; photo sources = "Sumber foto" (EN "Photo sources").
- Keep Google Drive UI names as Drive names them. Keep folder names in backticks exactly as they are when they are real folder names the user will type (e.g. `edited`, `print` only where a folder example requires it, see below).
- Preserve ICU placeholders exactly as written (e.g. `{section}`, `{mode}`). Do not translate or remove them.
- Never concatenate translated fragments. Each key is one complete sentence or label.

## Business rule that the copy must match (BR-GAL-007, verbatim)

"A source is synced with its whole folder tree. The Owner maps subfolders of a linked folder to selection items of the project's package (*Dipakai untuk pilihan foto klien*); mapping is optional and may be done before the subfolder exists. One subfolder maps to one item; one item may have several subfolders. An image inside a mapped subfolder (at any depth below it; the longest mapped folder wins) is a finished file for that item: `EDITED` for a `COUNT` item, `PRINT` for a `QUANTITY` item. Every other image is a `PROOF`. No folder name is recognised by itself any more (`edited` / `print` included). Saving a mapping reclassifies the stored photos at once; a sync that finds subfolders the Owner hasn't seen yet names them. A client pick of a photo that becomes a finished file stays as it is. A package without selection items has nothing to map; the Owner is pointed to *Isi paket*."

Consequences for the copy:
- Finished files go in subfolders the Owner later maps to the project's package items on the gallery page. Any folder name works.
- Unmapped photos stay selection photos (for the client to choose).
- The copy must NOT present `edited` or `print` as special folder names. They may appear only as an example name a photographer might choose, and then must be labelled as mapped to a package item (Edited photos / Printed photos), never as the rule.

## Current copy (for reference; these are what we are replacing)

Source guide (shown in the "Photo sources" panel, Drive folder setup):
- guideStep3 EN: "For final delivery, add subfolders named `edited` and `print` later." ID: "Untuk hasil akhir, tambahkan subfolder bernama `edited` dan `print` nanti."
- treeEdited (diagram label of an example subfolder) EN: "Edited files, added later" ID: "Hasil edit, ditambahkan nanti"
- treePrint (diagram label of an example subfolder) EN: "Print files, added later" ID: "File cetak, ditambahkan nanti"
- treeRoot (diagram root example name) EN/ID: "Rina & Dimas" (keep; not part of the draft)
- treeRootMeta (diagram root annotation) EN: "Selection photos or session subfolders" ID: "Foto pilihan atau subfolder sesi" (keep; not part of the draft)

Photo sources empty state and link dialog (gallery page):
- sourcesEmptyBody EN: "Link a project folder. Photos outside `edited` and `print` folders are for selection; those named folders hold final files." ID: "Tautkan folder proyek. Foto di luar folder `edited` dan `print` untuk pilihan klien; kedua folder itu untuk hasil akhir."
- sourcesEmptyBodyMobile EN: "Link the project's Google Drive folder." ID: "Tautkan folder Google Drive proyek ini." (keep unless it is also wrong)
- linkDialogDescription EN: "Files in `edited` or `print` folders are final files. Other photos, including session subfolders, are for selection." ID: "File di folder `edited` atau `print` adalah hasil akhir. Foto lainnya, termasuk di subfolder sesi, untuk pilihan klien."

Package item dialogs (booking/catalog):
- pickModeMeta: a subtitle showing the client-choice mode, with ICU argument `{mode}` (the value is a mode name such as "Photos to edit" or "Photos to print"). EN currently wrongly reads "Pilihan klien: {mode}" (Indonesian in the English UI). ID currently: "Pilihan klien: {mode}".
- fieldDialogDescription: subtitle of the "Add booking field" dialog. EN currently wrongly reads "Diisi saat membuat proyek dari layanan ini." (Indonesian in the English UI). ID currently: "Diisi saat membuat proyek dari layanan ini."

Tone reference (the existing "workspace not found" screen, which we want to match):
- title EN "Workspace not found" / ID "Ruang kerja tidak ditemukan"
- body EN "This workspace isn't available." / ID "Ruang kerja ini tidak tersedia."
- back EN "Back to workspaces" / ID "Kembali ke ruang kerja"

## Keys to draft

Draft EN and ID for ALL of these keys:

1. Namespace `pageNotFound` (new). A page or record inside a workspace does not exist, or was removed (e.g. a wrong link, a deleted project, a deleted gallery or service). The workspace's sidebar stays visible, so the text is shown inside the workspace layout. Keys:
   - `title`: short heading, say the page does not exist or was removed. Do NOT say "workspace not found".
   - `body`: one sentence, may say it was moved or removed.
   - `backToSection`: a link back to the parent list. ICU argument `{section}` is the section name, e.g. "Projects". Example EN: "Back to {section}". Keep the `{section}` placeholder in both EN and ID. ID example: "Kembali ke {section}".
   - `backToDashboard`: a link back to the workspace dashboard. No argument.

2. `guideStep3` (replace). Finished files go in subfolders the Owner maps later to the project's package items on the gallery page; any folder name works; unmapped photos stay selection photos. Must not name `edited` or `print` as special.

3. `treeEdited` and `treePrint` (replace). Diagram labels for two example subfolders an Owner might name, for instance "Hasil Edit" and "Cetak" in ID (or "Edited" and "Print" in EN). They must be labelled as mapped to Edited photos / Printed photos later (package items), not as special folder names. Keep the label short, like the current ones.

4. `sourcesEmptyBody` (replace). Empty state on the gallery page: link a project folder; photos are for selection unless the Owner maps a subfolder to a package item, in which case those files are final files. Do not name `edited` or `print` as special.

5. `linkDialogDescription` (replace). The add-folder dialog description: same mapping rule as above, shorter.

6. `pickModeMeta` (EN only needs a rewrite, but give ID too, may keep the current ID). Keep `{mode}`.

7. `fieldDialogDescription` (EN only needs a rewrite, but give ID too, may keep the current ID).

Output format reminder: one Markdown table, header row `| key | EN | ID | note |`, one row per key, with the keys `pageNotFound.title`, `pageNotFound.body`, `pageNotFound.backToSection`, `pageNotFound.backToDashboard`, `guideStep3`, `treeEdited`, `treePrint`, `sourcesEmptyBody`, `linkDialogDescription`, `pickModeMeta`, `fieldDialogDescription`. Put any ICU argument in the note column. Do not add prose. Do not wrap the table in a code fence.
````

</details>

## Codex output (raw)

<details>
<summary>Raw stdout of the Codex run</summary>

````text
| key | EN | ID | note |
|---|---|---|---|
| pageNotFound.title | Page not found | Halaman tidak ditemukan |  |
| pageNotFound.body | This page may have been moved or removed. | Halaman ini mungkin dipindahkan atau dihapus. |  |
| pageNotFound.backToSection | Back to {section} | Kembali ke {section} | Keeps ICU argument `{section}`. |
| pageNotFound.backToDashboard | Back to dashboard | Kembali ke dasbor |  |
| guideStep3 | Later, map any subfolder to a package item on the gallery page. Files in mapped subfolders are final files; unmapped photos stay available for selection. | Nanti, petakan subfolder apa pun ke item paket di halaman galeri. File di subfolder yang dipetakan menjadi hasil akhir; foto yang belum dipetakan tetap tersedia untuk dipilih. | Source guide step 3. |
| treeEdited | Edited, mapped to Edited photos later | Hasil Edit, dipetakan ke Hasil edit nanti | Diagram label for an example folder. |
| treePrint | Print, mapped to Printed photos later | Cetak, dipetakan ke Foto cetak nanti | Diagram label for an example folder. |
| sourcesEmptyBody | Link a project folder. Photos are for selection unless you map a subfolder to a package item; files in mapped subfolders are final files. | Tautkan folder proyek. Foto digunakan untuk pilihan kecuali subfolder dipetakan ke item paket; file di subfolder yang dipetakan menjadi hasil akhir. | Gallery page empty state. |
| linkDialogDescription | Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files. | Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir. | Add-folder dialog description. |
| pickModeMeta | Client choice: {mode} | Pilihan klien: {mode} | Keeps ICU argument `{mode}`. |
| fieldDialogDescription | Filled in when creating a project from this service. | Diisi saat membuat proyek dari layanan ini. | Add booking field dialog subtitle. |
````

</details>
