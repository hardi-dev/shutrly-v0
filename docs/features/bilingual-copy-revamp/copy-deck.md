# Shutrly — bilingual copy deck

Status: DRAFT for Owner review · product/headline review 2026-10-06 · English is the default.

This is the single editorial review document for the bilingual revamp. It groups proposed English and Indonesian copy by feature, page and state. It does not change application code or approve new workflows. Page paths below are verified against this branch; `/w/{workspaceId}` is abbreviated as `{workspace}`. Paths beginning with `/services`, `/clients`, `/projects`, `/team` or `/message-templates` in a page group are suffixes under that workspace, not additional root routes. Dialogs and sheets belong to their parent page, not separate routes.

## Reading and implementation notes

- Tables show alternatives for the selected language, never two languages on an ordinary reader page. Clearly labeled EN/ID authoring fields are the intentional editing exception.
- `{name}`, `{count}`, `{date}` and similar values are editorial placeholders. Preserve supplied identity names, identifiers, file/folder names, links and passwords. Whole sentences must become localized message factories with plural rules; do not concatenate translated fragments. WhatsApp variables retain their existing `{{variableName}}` syntax.
- Counts use locale formatting and correct English singular/plural. `{amount}` remains an exact IDR value. Existing currency/timezone and parsing behavior must be preserved; formatting examples do not approve a new parser.
- Shared copy in section 1 applies wherever its action exists. Feature tables add context-specific wording. Mobile may use a shorter visible label only when its accessible name retains the full action.
- Proposed terminology: **Workspace → Ruang kerja**, **Invoice → Tagihan**, **Booking → Pemesanan**, **Proof → Foto pilihan**, **Edited → Hasil edit**, **Print → Foto cetak**. This chooses fully localized UI wording for review, superseding the earlier borrowed-term proposal only after Owner approval. Database enums stay unchanged. Drive subfolder names are not required: subfolders are mapped to package items (BR-GAL-007), and no folder name is special.
- Ordinary descriptive content needs matching reviewed EN/ID versions. Internal notes, cancellation reasons and existing free-text display titles still need classification/legacy policy; this deck does not translate actual user records or identity names.
- Existing limits and consequences are taken from current copy, validation and feature rules. They must stay tied to their owning constants. A draft marked **Future surface** is not approved for implementation without its feature spec and Pencil exports.
- This is a static editorial draft, not a browser, layout or accessibility verification. Recipient-language, persistence, readiness and historical-data decisions remain open under [localization policy](../../product/localization.md).

## Product-message review — 2026-10-06

The Owner’s product emphasis is the photo-choice handoff: help the photographer know which photos the client wants edited. F-09/F-10/F-11/F-12 form that core workflow; project administration supports it. The previous project-record headline was too narrow as overall positioning. The selection-led product headline below is the recommended intended-product direction; the project-record headline remains interim wording for existing capabilities. Page headings and action labels remain direct.

Product authority: [overview](../../product/overview.md), [scope](../../product/scope.md), [journeys](../../product/user-journeys.md), [feature availability](../../product/feature-map.md), [localization policy](../../product/localization.md), and [pricing caveats](../../product/pricing-and-costs.md). Product scope is intent; it is not evidence that every capability is available today.

| Finding / previous wording | Editorial decision | Evidence / boundary |
|---|---|---|
| Project-record headline treated as the main product promise | Lead intended-product copy with the gallery/client-selection handoff; retain project-record copy only as an interim current-capability message. | Owner emphasis 2026-10-06; F-09–F-12 and J-04/J-06. No new selection actor or feature is inferred. |
| “Manage your bookings, galleries and invoices” on auth | Remove invoicing from the current auth pitch; it is not implemented in this branch. | F-14/F-15 TODO in the feature map; existing Owner gallery is not the complete client journey. |
| “This workspace is still empty” / promised project and invoice summaries | Use settings guidance and real navigation. Do not infer that the user has no records or announce an unapproved dashboard release. | Dashboard component receives identity, not project counts; dashboard remains a placeholder. |
| “One place per brand” / “Ruang terpisah” | Explain separate client/project records for each brand, without implying freelancer/team access. | BR-WS-002/003; BR-TEAM-001. |
| “The agreed deal never drifts” / “frozen” | Catalog changes do not rewrite project records; explicit project edits remain possible until shooting. | C-102, BR-CAT-003, BR-PRJ-009. |
| “No upload/storage cost” | Originals stay in Drive; no free-storage or zero-cost claim. | Provider storage costs and Shutrly pricing are separate; pricing remains undecided. |
| “Private gallery” without qualification | Describe app-level link/password access and disclose public Drive/image-link limits nearby. | BR-ACC-005, BR-SRC-004, ADR-019. Do not claim complete media revocation. |
| Root-only selection-photo guide | Ordinary session subfolders are supported; subfolders mapped to a package item hold final files. | BR-GAL-007. Folder names are identifiers, not translated UI labels. |
| Sync errors say “existing photos unchanged” | Say sync could not finish, with a retry action; do not promise rollback. | ADR-019: completed earlier sync steps may already be saved. |
| “Only booked projects” | Confirm booking before creating a gallery; do not imply later live stages are ineligible. | BR-GAL-009 allows BOOKED through COMPLETED, excluding DRAFT/CANCELLED. |
| “Variables” as the main editor explanation | Explain inserting project details and checking the sample message. Preserve exact placeholder syntax in the detailed helper. | F-03 renderer includes client, brand, gallery and invoice values; no automatic sending. |
| Cost/competitor assumptions as proof | Keep dated research out of public copy. Do not treat a free-plan scenario as an approved offer or a tenant-capacity guarantee. | Pricing document is historical/draft; staging runtime changed under ADR-020. |

### Primary product headline — intended F-10/F-11 experience

**Placement:** overall product introduction and shared auth editorial panel once client gallery access and selection are available. These are draft text replacements for existing editorial slots, not a new page or implementation approval. Do not publish the present-tense support as an available capability before F-10/F-11 are verified.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Primary product headline | Help clients choose the photos to edit. | Bantu klien memilih foto untuk diedit. |
| Primary supporting copy | Clients choose photos in your gallery within their package allowance. Review their selections to see which photos to edit. | Klien memilih foto di galerimu sesuai jatah paket. Cek pilihannya untuk tahu foto mana yang perlu kamu edit. |
| Drive mechanism, supporting line | Link the project’s Drive photos to a gallery for client selection. | Tautkan foto proyek dari Drive ke galeri untuk dipilih klien. |
| Delivery continuation, only with F-12 | Share the finished photos through the same gallery. | Bagikan hasil akhir lewat galeri yang sama. |

The photographer benefit is clarity about the photos to work on; the client’s action is selecting them. The feature map does not approve automatic photo ranking, an editing tool, automatic filename matching, a photographer-only culling UI or an exported selection list. Do not add those promises to the copy. F-11 review UI details still require its own discovery/design; this headline expresses the documented journey, not a new control.

### Plain-language guardrails

Use **project details**, **agreed price**, **shoot schedule**, **photo allowance** and **insert project details** in explanatory copy. Avoid “operational platform”, “entitlement-aware”, “snapshot” and “idempotent” in customer headlines; their precise technical meanings belong in specs. Keep essential UI terms such as Project, Service and Workspace, with a task-specific explanation on first use. Names of fields, statuses and irreversible actions stay exact.

Descriptions explain an action and its useful result only where supported. Do not add “all-in-one”, automatic reminders/sync, guaranteed time savings, faster payment, team collaboration or complete end-to-end availability. No new landing page or capability is introduced by this review. Longer revised descriptions still need both-language text-fit review in approved Pencil frames.

## Page map

| Feature | Where the copy appears | Status |
|---|---|---|
| Shared UI and shell | All owner pages; reusable dialogs, media viewer and error boundary | Existing; language switch proposed |
| Authentication | `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password`, `/account-unavailable` | Existing |
| Account | `/profile` | Existing |
| Workspace | `/onboarding/workspace`, `{workspace}`, `{workspace}/settings`; `/workspace` is a redirect | Existing |
| Catalog | `{workspace}/services`, `/services/categories`, `/services/items`, `/services/{serviceId}` | Existing |
| Clients | `{workspace}/clients`, `/clients/archived`; add/edit dialogs | Existing |
| Projects and sessions | `{workspace}/projects`, `/projects/completed`, `/projects/cancelled`, `/projects/new`, `/projects/{projectId}` | Existing |
| Team | `{workspace}/team`, `/team/archived`, `/team/roles`; project session dialogs | Existing |
| Photo sources | `{workspace}/photo-sources` | Existing |
| Gallery management | `{workspace}/projects/{projectId}/gallery`; gallery card on project detail | Existing owner surface |
| Message templates | `{workspace}/message-templates`, `/message-templates/{templateType}` | Existing editor; recipient output used by later sharing features |
| Auth emails | Verification/reset email in recipient inbox | Existing channel, not an app page |
| Bilingual authoring | Descriptive content/template editors on their owning pages | Proposed; exact authoring flow pending |
| Client gallery | `/g/{token}`, `/photos`, `/final`, `/picks/{groupId}`, `/picks/{groupId}/review` | Section 14; built client routes and UI modules |
| Billing and sharing | Future invoice/payment and message-sharing surfaces | Future surface; use existing template drafts below |

## 1. Shared UI, navigation and language

**Pages:** all dashboard pages. Reusable media text also applies to existing owner gallery previews. Sources: `src/features/workspace/ui/owner-nav`, `owner-shell`; `src/ui/patterns/*`; `src/ui/primitives/*`; `src/app/error.copy.ts`.

### Common actions and states

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Save button | Save | Simpan |
| Save profile/settings | Save changes | Simpan perubahan |
| Save pending | Saving… | Menyimpan… |
| Save success | Changes saved. | Perubahan disimpan. |
| Save failed title | Changes couldn’t be saved | Perubahan belum tersimpan |
| Save failed; form values retained | Your entries are still here. Try saving again. | Isianmu masih ada. Coba simpan lagi. |
| Add | Add | Tambah |
| Add pending | Adding… | Menambahkan… |
| Edit | Edit | Ubah |
| Rename | Rename | Ganti nama |
| Delete | Delete | Hapus |
| Delete pending | Deleting… | Menghapus… |
| Archive | Archive | Arsipkan |
| Restore archived entity | Restore | Pulihkan |
| Activate | Activate | Aktifkan |
| Deactivate | Deactivate | Nonaktifkan |
| Undo reversible action | Undo | Batalkan |
| Cancel dialog | Cancel | Batal |
| Back navigation | Back | Kembali |
| Close dialog/sheet/viewer | Close | Tutup |
| Done | Done | Selesai |
| Retry | Try again | Coba lagi |
| Select placeholder | Select an option | Pilih salah satu |
| Optional field suffix | (optional) | (opsional) |
| Required marker | Required | Wajib |
| Loading | Loading… | Memuat… |
| Load more | Load more | Muat lebih banyak |
| Search | Search | Cari |
| Clear search | Clear search | Hapus pencarian |
| Row/menu accessible name | Actions for {name} | Tindakan untuk {name} |
| Actions column | Actions | Tindakan |
| Notification region | Notifications | Notifikasi |
| Dismiss alert/toast | Dismiss notification | Tutup notifikasi |
| Unread badge accessible text | {count} unread notifications | {count} notifikasi belum dibaca |
| Irreversible action note | This can’t be undone. | Tindakan ini tidak bisa dibatalkan. |
| Route error title | Something went wrong | Ada kendala |
| Route error body | Try again in a moment. | Coba lagi sebentar lagi. |
| Empty data value | — | — |

### Owner navigation and shell

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Dashboard | Dashboard | Dasbor |
| Projects | Projects | Proyek |
| Clients | Clients | Klien |
| Invoices | Invoices | Tagihan |
| Services | Services | Layanan |
| Team | Team | Tim |
| Catalog group | Catalog | Katalog |
| Message templates | Message templates | Templat pesan |
| Photo sources | Photo sources | Sumber foto |
| Settings | Settings | Pengaturan |
| Profile | Profile | Profil |
| Main project CTA | New project | Proyek baru |
| Mobile overflow | More | Lainnya |
| Mobile menu description | Workspace menu | Menu ruang kerja |
| Menu button | Menu | Menu |
| Sign out | Sign out | Keluar |
| Create workspace | Create workspace | Buat ruang kerja |
| Skip link | Skip to content | Langsung ke konten |
| Navigation accessible name | Main navigation | Navigasi utama |
| Sidebar region | Sidebar navigation | Navigasi samping |
| Collapse sidebar | Collapse sidebar | Ciutkan navigasi samping |
| Expand sidebar | Expand sidebar | Buka navigasi samping |
| Breadcrumb accessible name | Page location | Lokasi halaman |
| Dashboard subtitle | Track active projects, sessions and delivered work. | Pantau proyek aktif, sesi, dan hasil yang sudah dikirim. |
| Projects subtitle | Check each shoot’s package, agreed price and schedule. | Cek paket, harga sepakat, dan jadwal tiap pemotretan. |
| Projects mobile subtitle | Project details and shoot schedules. | Detail proyek dan jadwal pemotretan. |
| Clients subtitle | Save client contacts so you can choose them when creating a project. | Simpan kontak klien agar bisa dipilih saat membuat proyek. |
| Clients mobile subtitle | People booking your shoots. | Klien yang memesan sesi foto. |
| Services subtitle | Set up packages once, then copy their details into new projects. | Siapkan paket layanan, lalu salin isinya saat membuat proyek baru. |
| Team subtitle | Record who works each session and their role. | Catat siapa yang bertugas di tiap sesi dan perannya. |
| Team mobile subtitle | Team members and session roles. | Anggota tim dan peran tiap sesi. |
| Settings subtitle | Set the brand name, contact details and invoice prefix for this workspace. | Atur nama merek, kontak, dan awalan nomor tagihan ruang kerja ini. |
| Templates subtitle | Write reusable client messages. Sharing them through WhatsApp is a separate step. | Siapkan teks pesan klien untuk dipakai ulang. Membagikannya lewat WhatsApp adalah langkah terpisah. |
| Sources subtitle | Set up a Google Drive source to link photo folders to galleries. | Siapkan sumber Google Drive untuk menautkan folder foto ke galeri. |
| Coming-soon page title | Coming soon | Segera hadir |
| Coming-soon body | This feature isn’t available yet. | Fitur ini belum tersedia. |
| Coming-soon back | Back to dashboard | Kembali ke dasbor |

### Language switch — proposed control

**Pages:** authentication, owner shell and future client gallery shell. Placement and persistence need design. Language names are intentionally recognizable self-names in this control, not bilingual body copy.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Accessible control name | Language | Bahasa |
| English option | English | English |
| Indonesian option | Bahasa Indonesia | Bahasa Indonesia |
| Switching pending | Changing language… | Mengganti bahasa… |
| Switch failed | Couldn’t change the language. Try again. | Bahasa belum diganti. Coba lagi. |

### Account menu (design 2026-10-11; proposed copy, pending Owner review)

**Pages:** owner shell account menu (desktop sidebar account block, mobile menu sheet). Theme items are shown but have no action until the next phase.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Account menu accessible name | Account menu | Menu akun |
| Account group label (mobile sheet) | Account | Akun |
| Theme group label / row | Theme | Tema |
| Light theme option | Light | Terang |
| Dark theme option | Dark | Gelap |
| System theme option | System | Sistem |

### Shared photo and media controls

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Viewer accessible name | Preview {filename} | Pratinjau {filename} |
| Previous photo | Previous photo | Foto sebelumnya |
| Next photo | Next photo | Foto berikutnya |
| Filmstrip accessible name | Other photos | Foto lainnya |
| Position announcement | Photo {position} of {total} | Foto {position} dari {total} |
| Folder accessible name | {folderName}, {count} photos | {folderName}, {count} foto |
| Missing badge | Missing | Hilang |
| Missing accessible suffix | File missing | File hilang |
| Download action, where available | Download photo | Unduh foto |
| Remove from selection, future selection UI | Remove from selection | Hapus dari pilihan |

## 2. Authentication

Sources: `src/features/auth/ui/*/*.copy.ts`, `src/ui/patterns/split-layout`, `editorial-panel`. Current auth screens support the following states; wording preserves anti-enumeration and security consequences.

### 2.1 Sign in — `/login`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Welcome back | Selamat datang kembali |
| Lead — Owner-approved wording; intended selection/delivery experience | Your next shoot, photos to edit, and results to deliver. Pick up where you left off. | Jadwal pemotretan berikutnya, foto untuk diedit, dan hasil untuk dikirim. Masuk dan lanjutkan pekerjaanmu. |
| Email label | Email | Email |
| Email placeholder | you@studio.com | nama@studio.com |
| Password label | Password | Kata sandi |
| Password placeholder | Enter your password | Masukkan kata sandimu |
| Forgot-password link | Forgot your password? | Lupa kata sandi? |
| Main CTA | Sign in | Masuk |
| Pending CTA | Signing in… | Sedang masuk… |
| Google CTA | Continue with Google | Lanjutkan dengan Google |
| Register prompt | New to Shutrly? | Baru di Shutrly? |
| Register link | Create an account | Buat akun |
| Interim editorial headline; existing project capabilities, not the primary product positioning | Keep each shoot’s details together. | Catat detail tiap pemotretan di satu tempat. |
| Interim editorial description; existing project capabilities | Record the client’s package, agreed price and shoot schedule in one project. | Catat paket klien, harga sepakat, dan jadwal pemotretan dalam satu proyek. |

### 2.2 Registration — `/register`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Create your account | Buat akunmu |
| Lead | Start recording what each client has booked and when you’ll shoot. | Mulai catat paket yang dipesan tiap klien dan jadwal pemotretannya. |
| Name label | Your name | Namamu |
| Name placeholder | Full name | Nama lengkap |
| Email | Email | Email |
| Email placeholder | you@studio.com | nama@studio.com |
| Password | Password | Kata sandi |
| Password placeholder | 8–128 characters | 8–128 karakter |
| Main CTA | Create account | Buat akun |
| Pending CTA | Creating account… | Membuat akun… |
| Existing-account prompt | Already have an account? | Sudah punya akun? |
| Existing-account link | Sign in | Masuk |

### 2.3 Email verification — `/verify`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Pending title | Check your email | Cek emailmu |
| Pending lead | If this address needs verification, a link is on its way. Open it to continue. | Kalau alamat ini perlu diverifikasi, tautannya sedang dikirim. Buka tautannya untuk melanjutkan. |
| Expiry alert | The link is valid for 24 hours | Tautan berlaku 24 jam |
| Inbox help | Check your spam folder if the email hasn’t arrived. | Cek folder spam kalau emailnya belum masuk. |
| Resend CTA | Resend verification email | Kirim ulang email verifikasi |
| Cooldown, complete message | You can request another email in {seconds} seconds. | Kamu bisa meminta email lagi dalam {seconds} detik. |
| Resent success | A new link has been sent. | Tautan baru sudah dikirim. |
| Back | Back to sign in | Kembali ke halaman masuk |
| Invalid-link title | This link is no longer valid | Tautan ini sudah tidak berlaku |
| Invalid-link lead | It may have expired or already been used. Request a new link to continue. | Tautannya mungkin kedaluwarsa atau sudah dipakai. Minta tautan baru untuk melanjutkan. |
| Single-use alert title | Each link can be used once | Setiap tautan hanya bisa dipakai sekali |
| Single-use body | Verification and password-reset links can only be used once. | Tautan verifikasi dan atur ulang kata sandi hanya bisa dipakai sekali. |
| Invalid-link action | Request a new link | Minta tautan baru |

### 2.4 Forgot password — `/forgot-password`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Reset your password | Atur ulang kata sandi |
| Lead | Enter your email. If password reset is available for this address, we’ll send a link. | Masukkan emailmu. Kalau atur ulang kata sandi tersedia untuk alamat ini, kami akan mengirim tautannya. |
| Email placeholder | you@studio.com | nama@studio.com |
| Main CTA | Send reset link | Kirim tautan atur ulang |
| Pending CTA | Sending… | Mengirim… |
| Sign-in prompt | Remember your password? | Ingat kata sandimu? |
| Back | Back to sign in | Kembali ke halaman masuk |
| Sent-state title | Check your inbox | Cek kotak masukmu |
| Sent-state lead | If password reset is available for this address, we’ll send a link. | Kalau atur ulang kata sandi tersedia untuk alamat ini, kami akan mengirim tautannya. |
| Expiry alert | The link is valid for one hour | Tautan berlaku satu jam |
| Inbox help | Check your spam folder if the email hasn’t arrived. | Cek folder spam kalau emailnya belum masuk. |

### 2.5 Reset password — `/reset-password`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Set a new password | Buat kata sandi baru |
| Lead | Use 8–128 characters. After resetting, sign in again on each device. | Gunakan 8–128 karakter. Setelah diatur ulang, masuk lagi di setiap perangkat. |
| Password label | New password | Kata sandi baru |
| Password placeholder | Enter a new password | Masukkan kata sandi baru |
| Confirmation label | Confirm new password | Konfirmasi kata sandi baru |
| Confirmation placeholder | Enter it again | Masukkan sekali lagi |
| CTA | Save new password | Simpan kata sandi baru |
| Pending CTA | Saving… | Menyimpan… |
| Invalid-link title | This reset link is no longer valid | Tautan atur ulang ini sudah tidak berlaku |
| Invalid-link lead | Request a new password-reset link to continue. | Minta tautan atur ulang kata sandi yang baru untuk melanjutkan. |
| Invalid-link action | Request reset link | Minta tautan atur ulang |
| Single-use alert | Each reset link can only be used once. | Setiap tautan atur ulang hanya bisa dipakai sekali. |
| Sign-in prompt | Remember your password? | Ingat kata sandimu? |
| Back | Back to sign in | Kembali ke halaman masuk |

### 2.6 Unavailable account — `/account-unavailable`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Account unavailable | Akun tidak tersedia |
| Lead | This account can’t access Shutrly right now. Contact support if you think this is a mistake. | Akun ini belum bisa mengakses Shutrly. Hubungi dukungan kalau menurutmu ini keliru. |
| Alert title | Workspace data is hidden | Data ruang kerja disembunyikan |
| Alert body | Your workspaces and personal data aren’t displayed while access is unavailable. | Ruang kerja dan data pribadimu tidak ditampilkan selama akses tidak tersedia. |
| CTA | Sign out | Keluar |

### 2.7 Auth validation and errors — all auth forms

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Name required | Enter your name. | Isi namamu. |
| Name too long | Use no more than 100 characters. | Gunakan maksimal 100 karakter. |
| Invalid email | Enter a valid email address. | Masukkan alamat email yang valid. |
| Password required | Enter your password. | Masukkan kata sandimu. |
| Password length | Use 8–128 characters. | Gunakan 8–128 karakter. |
| Confirmation mismatch | The passwords don’t match. Enter them again. | Kata sandinya belum cocok. Masukkan lagi. |
| Incorrect current password | Your current password is incorrect. | Kata sandi saat ini salah. |
| Show password accessible name | Show password | Tampilkan kata sandi |
| Hide password accessible name | Hide password | Sembunyikan kata sandi |
| Validation summary | Check the highlighted fields. | Cek kolom yang ditandai. |
| Invalid credentials | The email or password is incorrect. | Email atau kata sandi salah. |
| Rate limited | Too many attempts. Try again later. | Terlalu banyak percobaan. Coba lagi nanti. |
| Email unverified | Verify your email to continue. | Verifikasi emailmu untuk melanjutkan. |
| Authentication required | Sign in to continue. | Masuk untuk melanjutkan. |
| Invalid token | This link may have expired or already been used. | Tautannya mungkin kedaluwarsa atau sudah dipakai. |
| Google cancelled | Google sign-in was canceled. | Proses masuk dengan Google dibatalkan. |
| Google failed | Couldn’t sign in with Google. Try again. | Belum bisa masuk dengan Google. Coba lagi. |
| Email failed | Couldn’t send the email. Try again in a moment. | Email belum terkirim. Coba lagi sebentar lagi. |

## 3. Account and profile

**Page:** `/profile`. Sources: `account-sections`, `profile-form`, `change-password-form`. Authentication validation in section 2.7 also applies.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page/section title | Profile | Profil |
| Profile description | Update the name shown across your workspaces. | Perbarui nama yang tampil di semua ruang kerjamu. |
| Email label | Email address | Alamat email |
| Name label | Display name | Nama tampilan |
| Save CTA | Save changes | Simpan perubahan |
| Saved | Profile updated. | Profil diperbarui. |
| Password section | Password | Kata sandi |
| Password description | Change your password. Your other sessions will be signed out. | Ganti kata sandimu. Sesi di perangkat lain akan dikeluarkan. |
| Current password label | Current password | Kata sandi saat ini |
| Current placeholder | Enter your current password | Masukkan kata sandi saat ini |
| New password label | New password | Kata sandi baru |
| New password placeholder | 8–128 characters | 8–128 karakter |
| Confirmation label | Confirm new password | Konfirmasi kata sandi baru |
| Confirmation placeholder | Enter it again | Masukkan sekali lagi |
| Change CTA | Change password | Ganti kata sandi |
| Change pending | Changing password… | Mengganti kata sandi… |
| Change success | Password changed. Your other sessions have been signed out. | Kata sandi diganti. Sesi di perangkat lain sudah dikeluarkan. |
| Google-only title | You sign in with Google | Kamu masuk dengan Google |
| Google-only body | This account has no password. Choose Continue with Google to sign in. | Akun ini tidak punya kata sandi. Pilih Lanjutkan dengan Google untuk masuk. |

## 4. Workspace onboarding, dashboard and settings

Sources: `src/features/workspace/ui/*/*.copy.ts`, owner profile/workspace layout copy. `/workspace` resolves the last-opened workspace and redirects; there is no standalone workspace-selection page. Switching/creation copy belongs to the owner-shell controls.

### 4.1 First workspace — `/onboarding/workspace`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Set up your first workspace | Siapkan ruang kerja pertamamu |
| Lead | Create a workspace for this brand’s clients and projects. Start with its name. | Buat ruang kerja untuk klien dan proyek merek ini. Mulai dari namanya. |
| Name label | Workspace name | Nama ruang kerja |
| Name placeholder | e.g. Aster Wedding | Contoh: Aster Wedding |
| Main CTA | Create workspace | Buat ruang kerja |
| Preview label | Your workspace | Ruang kerjamu |
| Benefits accessible heading | What’s included | Yang kamu dapatkan |
| Separation benefit | Separate records for each brand | Catatan terpisah untuk tiap merek |
| Separation body | Keep this brand’s client and project records separate from your other brands. | Pisahkan catatan klien dan proyek merek ini dari merekmu yang lain. |
| Invoice-prefix benefit; AW only for Aster Wedding preview | Invoice prefix: {prefix} | Awalan nomor tagihan: {prefix} |
| Invoice-prefix body | Created from the name. You can change it in workspace settings. | Dibuat dari nama. Bisa diubah di pengaturan ruang kerja. |
| Currency benefit | Indonesian rupiah (IDR) | Rupiah Indonesia (IDR) |
| Currency body | The currency used in this workspace. | Mata uang yang dipakai di ruang kerja ini. |
| Signed-in label | Signed in as | Masuk sebagai |
| Identity display | {name} · {email} | {name} · {email} |
| Sign out | Sign out | Keluar |

### 4.2 Workspace creation and switching — owner shell / `/workspace`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Create dialog title | Create workspace | Buat ruang kerja |
| Create description | Create a separate workspace for another brand’s clients and projects. | Buat ruang kerja terpisah untuk klien dan proyek merek lain. |
| Name label | Workspace name | Nama ruang kerja |
| Placeholder | e.g. Aster Family | Contoh: Aster Family |
| Helper | The invoice prefix comes from the name. You can change it later. | Awalan nomor tagihan dibuat dari nama. Bisa diubah nanti. |
| Switcher accessible name | Switch workspace | Pindah ruang kerja |
| Switcher trigger | Choose workspace | Pilih ruang kerja |
| Workspace count | {count} workspaces | {count} ruang kerja |
| Switch failed title | Couldn’t switch workspaces | Belum bisa pindah ruang kerja |
| Switch failed body | You’re still in {workspaceName}. | Kamu masih di {workspaceName}. |
| Unavailable-workspace title | Workspace not found | Ruang kerja tidak ditemukan |
| Unavailable-workspace body | This workspace isn’t available. | Ruang kerja ini tidak tersedia. |
| Unavailable-workspace action | Back to workspaces | Kembali ke ruang kerja |

### 4.3 Dashboard — `{workspace}`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Title | Dashboard | Dasbor |
| Welcome, complete message *(retired by F-26, 2026-10-15)* | Welcome to {workspaceName} | Selamat datang di {workspaceName} |
| Created toast | Workspace created | Ruang kerja dibuat |
| Description; existing placeholder dashboard *(retired by F-26, 2026-10-15)* | Use the navigation to open your projects, clients or services. | Buka proyek, klien, atau layanan lewat navigasi. |
| Empty title *(retired by F-26, 2026-10-15)* | Set up this workspace’s brand details | Lengkapi identitas merek ruang kerja ini |
| Empty body *(retired by F-26, 2026-10-15)* | Open settings to add the brand name, contact details and invoice prefix. | Buka pengaturan untuk melengkapi nama merek, kontak, dan awalan nomor tagihan. |
| Empty CTA *(retired by F-26, 2026-10-15)* | Set up branding | Lengkapi identitas merek |

### 4.3b Dashboard overview — `{workspace}` once the workspace has a project (F-26; drafted with the Codex CLI. Tile labels shortened to fit one line and approved by the Owner 2026-10-14, no period caption; the table, empty-state and screen-reader rows approved 2026-10-15, *Harga sepakat* kept from §7, title *Active projects* chosen by the Owner. Reused unchanged: §7.1 search, filter, no match and *No sessions scheduled*; §7.3 statuses and the row menu)

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Tile: projects created this month | New projects | Proyek baru |
| Tile: selection groups waiting for review | To review | Perlu dicek |
| Tile: projects in post-production | In editing | Sedang diedit |
| Tile: final deliveries published this month | Delivered | Terkirim |
| Table title | Active projects | Proyek aktif |
| Column: project | Project | Proyek |
| Column: next session | Next session | Sesi berikutnya |
| Column: status | Status | Status |
| Column: agreed price | Agreed price | Harga sepakat |
| Footer count (ICU plural on `total`) | Showing {shown} of {total, plural, one {# active project} other {# active projects}} | Menampilkan {shown} dari {total} proyek aktif |
| Footer link | View all projects | Lihat semua proyek |
| Next session today, no time | Today | Hari ini |
| Next session today, with time | Today, {time} | Hari ini, {time} |
| Badge on *To review* | {count} waiting | {count} menunggu |
| Empty title, only completed or canceled projects | No active projects | Belum ada proyek aktif |
| Empty body | Completed and canceled projects are in the project list. | Proyek selesai dan dibatalkan ada di daftar proyek. |
| Empty action | View project list | Lihat daftar proyek |
| Screen reader: ring on *To review* | {waiting} of {total} waiting 3 days or more | {waiting} dari {total} menunggu 3 hari atau lebih |
| Screen reader: ring on *In editing* | {ready} of {total} ready to edit | {ready} dari {total} siap diedit |
| Screen reader: sparkline | {label} per month, last 7 months | {label} per bulan, 7 bulan terakhir |
| Screen reader: trend badge | {delta} compared with the same days last month | {delta} dibandingkan dengan hari yang sama bulan lalu |

### 4.3a Setup checklist — `{workspace}` until the first project (F-25; drafted with the Codex CLI, approved by the Owner 2026-10-12; step bodies and locked hint rewritten compact for the design, Codex option 2 with terms in lower case and *Anda* → *kamu*, approved by the Owner the same day)

Shown in place of the *Empty* rows above while the workspace has no project ([F-25 spec](../setup-checklist/spec.md)). Markers reuse §1: *Required* / *Wajib*, *Optional* / *Opsional*. The two §7.2 rows marked *replaces* replaced §7.2 *No service body* and *No service CTA* when F-25 was built (2026-10-12).

| Element / context | English | Bahasa Indonesia | Review note |
|---|---|---|---|
| Checklist title | Set up your workspace | Siapkan ruang kerjamu | Option A chosen (Owner, 2026-10-12). |
| Checklist description | Add a service first, then follow the recommended and optional steps. | Tambahkan layanan dulu, lalu ikuti langkah yang disarankan dan opsional. | EN aligned to the ID (Owner). |
| Progress | {done} of {total} done | {done} dari {total} selesai | Plural-safe as written. |
| Recommended marker (step 2) | Recommended | Disarankan | |
| Optional marker (step 4) | Optional | Opsional | §4.3a note: markers reuse §1; §1 had no plain row (added at F-25 build; confirmed by the Owner 2026-10-12). |
| Locked hint (steps 2–3) | This step opens after you add a service | Langkah ini terbuka setelah kamu menambah layanan | Compact rewrite (design 2026-10-12) replaces *Complete Add a service first.* |
| Done status, accessible | Done | Selesai | Same as §1 *Done*. |
| Step 1 title | Add a service | Tambah layanan | |
| Step 1 body | Projects come from services; add categories in Add service | Proyek berawal dari layanan; kategori bisa dibuat lewat Tambah layanan | Compact rewrite replaces the two-sentence body. |
| Step 1 action | Add service | Tambah layanan | |
| Step 2 title | Add package items | Tambah isi paket | Drops "that the client picks from". |
| Step 2 body | “Foto edit 50” limits how many photos clients pick | “Foto edit 50” menentukan batas foto yang dipilih klien | Compact rewrite. |
| Step 2 action | Add package items | Tambah isi paket | |
| Step 3 title | Create your first project | Buat proyek pertamamu | |
| Step 3 body | Fill in client and shoot date in New project | Masukkan klien dan tanggal pemotretan lewat Proyek baru | Compact rewrite. |
| Step 3 action | New project | Proyek baru | Opens the form; its submit stays *Create project*. |
| Step 4 title | Set your brand name | Atur nama merek | |
| Step 4 body | Clients see {workspaceName} in messages and galleries until then | Sebelum diatur, klien melihat {workspaceName} di pesan dan galeri | Compact rewrite. |
| Step 4 action | Set brand name | Atur nama merek | |
| §7.2 No service body (*replaces*) | A project starts from a service in a category. Add both in the Add service dialog. | Proyek dimulai dari layanan dalam kategori. Tambahkan keduanya di dialog Tambah layanan. | |
| §7.2 No service CTA (*replaces*) | Add service | Tambah layanan | |

### 4.4 Workspace settings — `{workspace}/settings`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Brand section | Brand identity | Identitas merek |
| Brand description | Set the brand name for this workspace’s client-facing pages. | Atur nama merek untuk halaman ruang kerja ini yang dilihat klien. |
| Workspace name | Workspace name | Nama ruang kerja |
| Brand name | Brand name | Nama merek |
| Brand-name helper | Leave blank to use the workspace name. | Kosongkan untuk memakai nama ruang kerja. |
| Contact section | Contact details | Kontak |
| Contact description | Save the contact details to use on invoices when billing is available. | Simpan kontak untuk ditampilkan di tagihan saat fitur penagihan tersedia. |
| Contact email | Contact email | Email kontak |
| Phone | Phone number | Nomor telepon |
| Address | Address | Alamat |
| Invoice section | Invoices | Tagihan |
| Invoice description | Numbering format for this workspace’s invoices. | Format nomor tagihan untuk ruang kerja ini. |
| Prefix label | Invoice prefix | Awalan nomor tagihan |
| Prefix helper | Use 2–6 letters or numbers. Applies to new invoices only. | Gunakan 2–6 huruf atau angka. Hanya berlaku untuk tagihan baru. |
| Currency label | Currency | Mata uang |
| Currency value | IDR — Indonesian rupiah | IDR — Rupiah Indonesia |
| Currency helper | Only IDR is supported at the moment. | Saat ini hanya IDR yang didukung. |
| Save CTA | Save changes | Simpan perubahan |
| Saved title | Changes saved | Perubahan disimpan |
| Saved body | This workspace’s settings have been updated. | Pengaturan ruang kerja ini sudah diperbarui. |
| Server error body | Your entries are still here. Try saving again. | Isianmu masih ada. Coba simpan lagi. |

### 4.5 Workspace field validation

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Name required | Enter a workspace name. | Isi nama ruang kerja. |
| Name too long | Use no more than 60 characters. | Gunakan maksimal 60 karakter. |
| Name duplicate | You already have a workspace with this name. | Kamu sudah punya ruang kerja dengan nama ini. |
| Brand name too long | Use no more than 80 characters. | Gunakan maksimal 80 karakter. |
| Email invalid | Enter a valid email, such as hello@studio.com. | Masukkan email yang valid, misalnya halo@studio.id. |
| Phone invalid | Use 8–20 digits, spaces, +, - or parentheses. | Gunakan 8–20 angka, spasi, +, -, atau tanda kurung. |
| Address too long | Use no more than 300 characters. | Gunakan maksimal 300 karakter. |
| Prefix invalid | Use 2–6 letters or numbers. | Gunakan 2–6 huruf atau angka. |

## 5. Service catalog

**Pages:** `{workspace}/services`, `{workspace}/services/categories`, `{workspace}/services/items`, `{workspace}/services/{serviceId}`. Sources: `catalog-copy.copy.ts`, booking-field dialog, catalog tabs/skeletons and default item definitions. Category/service identity-name classification remains pending; sample names below are examples, not translations of stored names.

### 5.1 Service list and category list

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Service tab and detail parent | Services | Layanan |
| Category tab | Categories | Kategori |
| Item-definition tab | Package items | Isi paket |
| Tab accessible name | Service sections | Bagian layanan |
| Add service CTA | Add service | Tambah layanan |
| Add category CTA | Add category | Tambah kategori |
| Inline category creation | New category | Kategori baru |
| Service empty title | No services yet | Belum ada layanan |
| Service empty body | Create a category, then add a service with its price and package details. | Buat kategori dulu, lalu tambahkan layanan dengan harga dan isi paketnya. |
| Category-specific empty body | Add a service to this category with its price and package details. | Tambahkan layanan ke kategori ini dengan harga dan isi paketnya. |
| Category heading | Categories | Kategori |
| Category description | Group similar services so they’re easier to find. | Kelompokkan layanan sejenis agar lebih mudah dicari. |
| Category empty title | No categories yet | Belum ada kategori |
| Category empty body | Add a category, such as Graduation or Family, to group your services. | Tambahkan kategori, misalnya Wisuda atau Keluarga, untuk mengelompokkan layanan. |
| Service count | {count} services | {count} layanan |
| Package-item count | {count} package items | {count} isi paket |
| Status label | Status | Status |
| Active status | Active | Aktif |
| Archived status | Archived | Diarsipkan |
| Archive success | {entityType} archived | {entityType} diarsipkan |
| Reactivate success | Reactivated | Diaktifkan lagi |
| Delete success | Deleted | Dihapus |
| Loading announcement | Loading services… | Memuat layanan… |
| Category loading announcement | Loading categories… | Memuat kategori… |
| Item loading announcement | Loading package items… | Memuat isi paket… |

Use a translated entity type in the archive message, not an English enum or a raw technical key.

### 5.2 Create/edit service and category dialogs

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add-service title | Add service | Tambah layanan |
| Add-service description | Set up package items and booking fields after creating the service. | Atur isi paket dan kolom pemesanan setelah layanan dibuat. |
| Edit-service title | Edit service | Ubah layanan |
| Edit-service description | Update the service name, category or base price. | Perbarui nama, kategori, atau harga dasar layanan. |
| Service name | Service name | Nama layanan |
| Service example | e.g. Graduation Basic | Contoh: Wisuda Dasar |
| Category label | Category | Kategori |
| Category placeholder | Choose a category | Pilih kategori |
| Base price | Base price | Harga dasar |
| Price placeholder | 0 | 0 |
| Price helper | Enter the price in whole rupiah, without decimals. | Isi harga dalam rupiah bulat, tanpa desimal. |
| Add-category title | Add category | Tambah kategori |
| Rename-category title | Rename category | Ganti nama kategori |
| Category description | For example, Graduation, Wedding or Family. | Misalnya Wisuda, Pernikahan, atau Keluarga. |
| Category name | Category name | Nama kategori |
| Category example | e.g. Pre-wedding | Contoh: Prapernikahan |
| Save | Save | Simpan |
| Cancel | Cancel | Batal |

### 5.3 Service detail — `{workspace}/services/{serviceId}`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page subtitle | Changes apply only to projects created afterward. | Perubahan hanya berlaku untuk proyek yang dibuat setelahnya. |
| Archived banner title | This service is archived | Layanan ini diarsipkan |
| Archived banner body | It can’t be selected for new projects. Existing projects stay unchanged. | Layanan ini tidak bisa dipilih untuk proyek baru. Proyek yang sudah dibuat tidak berubah. |
| Info section | Service details | Info layanan |
| Info description | Name, category and base price. | Nama, kategori, dan harga dasar. |
| Package section | Package items | Isi paket |
| Package description | Copied to new projects in this order. | Disalin ke proyek baru dalam urutan ini. |
| Package empty body | Add package items, such as 25 edited photos or 1–2 people. | Tambahkan isi paket, misalnya 25 foto edit atau 1–2 orang. |
| Client-choice group title | Photos the client chooses | Foto yang dipilih klien |
| Client-choice description | Set how many photos or prints the client can choose. Use whole numbers. | Atur jatah foto atau jumlah cetak yang bisa dipilih klien. Gunakan angka bulat. |
| Other-items group | Other package items | Isi paket lainnya |
| Other-items description | Package details that don’t require client photo selections. | Keterangan paket yang tidak dipilih klien. |
| Booking-fields section | Booking details | Detail pemesanan |
| Booking-fields description | Ask for details you need when creating a project, such as a university name. | Tambahkan detail yang perlu diisi saat membuat proyek, misalnya nama kampus. |
| Booking-fields empty | No extra booking details yet. Add a field if this service needs one. | Belum ada detail pemesanan tambahan. Tambahkan kolom kalau layanan ini membutuhkannya. |
| Add package item | Add package item | Tambah isi paket |
| Edit item value | Edit value | Ubah nilai |
| Remove item action | Remove from service | Hapus dari layanan |
| Move item up | Move up | Naikkan |
| Move item down | Move down | Turunkan |
| Add booking field | Add booking field | Tambah kolom pemesanan |
| Edit booking field | Edit booking field | Ubah kolom pemesanan |
| Remove booking field | Delete field | Hapus kolom |
| Remove item confirmation | Remove {name} from this service? | Hapus {name} dari layanan ini? |
| Remove field confirmation | Delete the “{name}” field? | Hapus kolom “{name}”? |
| Irreversible consequence | This can’t be undone. | Tindakan ini tidak bisa dibatalkan. |

### 5.4 Package item definitions — `{workspace}/services/items`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add-definition title | Add package item | Tambah isi paket |
| Edit-definition title | Edit package item | Ubah isi paket |
| Definition description | Create an item once, then use it in different service packages. | Buat item sekali, lalu pakai di berbagai paket layanan. |
| Item name | Item name | Nama item |
| Item-name example | e.g. Number of people | Contoh: Jumlah orang |
| Value type | Value format | Format nilai |
| Number type | Number | Angka |
| Number description | One value, such as 25 photos or 2 hours. | Satu nilai, misalnya 25 foto atau 2 jam. |
| Range type | Range | Rentang |
| Range description | A minimum and maximum, such as 1–2 people. | Nilai minimum dan maksimum, misalnya 1–2 orang. |
| Unit label | Unit | Satuan |
| Unit placeholder | e.g. people | Contoh: orang |
| Unit helper | Appears after the value, such as 2 hours. | Ditulis setelah nilai, misalnya 2 jam. |
| Selection switch | Used for client photo selections | Dipakai untuk pilihan foto klien |
| Selection type label | Selection type | Jenis pilihan |
| Edit-selection option | Photos to edit | Foto untuk diedit |
| Edit-selection description | The client chooses photos to edit. Counted per photo. | Klien memilih foto untuk diedit. Dihitung per foto. |
| Print-selection option | Photos to print | Foto untuk dicetak |
| Print-selection description | The client chooses photos and the number of prints. | Klien memilih foto dan jumlah cetaknya. |
| Pick-mode meta · Approved (Owner, 2026-10-12) | Client choice: {mode} | Pilihan klien: {mode} |
| Usage summary | Used in {count} services | Dipakai di {count} layanan |
| Unused summary | Not used yet | Belum dipakai |
| Locked definition | Value type and selection settings are locked because this item is used by a service. | Tipe nilai dan pengaturan pilihan terkunci karena item ini sudah dipakai layanan. |
| Service-item picker dialog | Add package item | Tambah isi paket |
| Picker description | Add an item to this service’s package. | Tambahkan isi paket ke layanan ini. |
| Picker label | Package item | Isi paket |
| Value label | Value | Nilai |
| Value placeholder | e.g. 25 | Contoh: 25 |
| Minimum | Minimum | Minimum |
| Minimum example | e.g. 1 | Contoh: 1 |
| Maximum | Maximum | Maksimum |
| Maximum example | e.g. 2 | Contoh: 2 |

### 5.5 Booking-field dialog — service detail

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Dialog description · Approved (Owner, 2026-10-12) | Filled in when creating a project from this service. | Diisi saat membuat proyek dari layanan ini. |
| Field name | Field name | Nama kolom |
| Field-name example | e.g. University name | Contoh: Nama kampus |
| Field type | Field type | Tipe kolom |
| Text option | Text | Teks |
| Long-text option | Long text | Teks panjang |
| Number option | Number | Angka |
| Date option | Date | Tanggal |
| Boolean option | Yes/No | Ya/Tidak |
| Select option | Choice | Pilihan |
| Required switch | Required field | Wajib diisi |
| Options label | Choices | Pilihan |
| Add option | Add choice | Tambah pilihan |
| Legacy comma-entry hint, only if that input exists | Separate choices with commas. | Pisahkan pilihan dengan koma. |
| Option placeholder | e.g. Campus A | Contoh: Kampus A |
| Option accessible name | Choice {index} | Pilihan {index} |
| Remove option accessible name | Remove choice {name} | Hapus pilihan {name} |
| Remove unnamed option | Remove new choice | Hapus pilihan baru |
| Required metadata | {type} · Required | {type} · Wajib |
| Optional metadata | {type} · Optional | {type} · Opsional |
| Choice metadata | {type}: {options} · {requirement} | {type}: {options} · {requirement} |

Translate `{type}` and `{requirement}`. User-authored `{options}` need their approved classification/content policy before bilingual rendering.

### 5.6 Delete-category confirmation and catalog validation

| Condition / context | English | Bahasa Indonesia |
|---|---|---|
| Delete-category title | Delete category “{name}”? | Hapus kategori “{name}”? |
| Allowed deletion | This category isn’t used anywhere. Deleting it can’t be undone. | Kategori ini belum dipakai. Penghapusannya tidak bisa dibatalkan. |
| Blocked title | This can’t be deleted | Belum bisa dihapus |
| Blocked body | “{name}” is still used by a service. Archive it to prevent use in new services. | “{name}” masih dipakai layanan. Arsipkan agar tidak dipilih untuk layanan baru. |
| Empty name | Enter a name. | Isi nama. |
| Name/choice too long | Use no more than 60 characters. | Gunakan maksimal 60 karakter. |
| Duplicate name | This name is already in use. | Nama ini sudah dipakai. |
| Unit too long | Use no more than 20 characters for the unit. | Satuan maksimal 20 karakter. |
| Selection requires number | Client selections require the Number value type. | Pilihan klien harus memakai tipe nilai Angka. |
| Selection type required | Choose a selection type. | Pilih jenis pilihan. |
| Unexpected selection type | Selection types apply only to client-selection items. | Jenis pilihan hanya untuk item yang dipilih klien. |
| Type locked | This value type is locked because a service uses the item. | Tipe nilai terkunci karena item ini dipakai layanan. |
| Category required | Choose a category. | Pilih kategori. |
| Archived reference | This option is archived. Choose another one. | Pilihan ini diarsipkan. Pilih yang lain. |
| Invalid number | Enter a valid number. | Isi angka yang valid. |
| Negative number | Enter zero or a positive number. | Isi nol atau angka positif. |
| Decimal precision | Use no more than 2 decimal places. | Gunakan maksimal 2 angka desimal. |
| Number too large | This number is too large. | Angkanya terlalu besar. |
| Whole-number constraint | Enter a whole number. | Isi angka bulat. |
| Invalid range | The maximum must be at least the minimum. | Maksimum harus sama atau lebih dari minimum. |
| Duplicate definition in service | This item is already in the service. | Item ini sudah ada di layanan. |
| Item not found | This item wasn’t found. | Item ini tidak ditemukan. |
| Choices required | Add at least one choice. | Tambahkan minimal satu pilihan. |
| Empty choice | Enter a choice. | Isi pilihan. |
| Duplicate choice | This choice is already listed. | Pilihan ini sudah ada. |
| Too many choices | Use no more than 50 choices. | Gunakan maksimal 50 pilihan. |
| Save failure | Changes couldn’t be saved. Try again. | Perubahan belum tersimpan. Coba lagi. |

### 5.7 Platform-owned default items

**Pages:** item-definition list, service/project package editors and future selection allowance display. These are proposed default content versions, not a migration of existing edited records.

| Default / unit | English | Bahasa Indonesia |
|---|---|---|
| Edit selection item | Edited photos | Foto edit |
| Edit selection unit | photos | foto |
| Print selection item | Printed photos | Foto cetak |
| Print selection unit | prints | lembar |
| People item | Number of people | Jumlah orang |
| People unit | people | orang |
| Duration item | Shoot duration | Durasi pemotretan |
| Duration unit | hours | jam |

## 6. Clients

**Pages:** `{workspace}/clients`, `{workspace}/clients/archived`; add/edit/delete dialogs. Sources: `client-copy.copy.ts`, clients table/skeletons and `client-field-error.ts`. These are people who book shoots; copy never implies a client login/account.

### 6.1 List, search and empty states

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page/list title | Clients | Klien |
| Active tab | Active | Aktif |
| Archived tab | Archived | Arsip |
| Tabs accessible name | Client status | Status klien |
| Count, active | {count} active clients | {count} klien aktif |
| Count, archived | {count} archived clients | {count} klien diarsipkan |
| Table client column | Client | Klien |
| Table phone column | WhatsApp | WhatsApp |
| Table social column | Social media | Media sosial |
| Table actions column | Actions | Tindakan |
| Search accessible name | Search clients | Cari klien |
| Search placeholder | Search by name or WhatsApp number | Cari nama atau nomor WhatsApp |
| Search result announcement | {count} matching clients | {count} klien cocok |
| No-results title | No matching clients | Belum ada klien yang cocok |
| No-results body | Try another name or part of a WhatsApp number. | Coba nama lain atau sebagian nomor WhatsApp. |
| Missing phone | No WhatsApp number yet | Belum ada nomor WhatsApp |
| First-use title | No active clients yet | Belum ada klien aktif |
| First-use body | Add someone booking a shoot, then choose them when creating a project. | Tambahkan klien yang memesan sesi foto, lalu pilih saat membuat proyek. |
| First-use CTA | Add client | Tambah klien |
| Archive empty title | No archived clients yet | Belum ada klien di arsip |
| Archive empty body | Archived clients appear here. You can restore them at any time. | Klien yang diarsipkan muncul di sini. Kamu bisa memulihkannya kapan saja. |
| WhatsApp row action | Open WhatsApp | Buka WhatsApp |

### 6.2 Add/edit client dialogs

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add title | Add client | Tambah klien |
| Add description | Choose this client when creating a project. | Klien ini bisa dipilih saat membuat proyek. |
| Edit title | Edit client | Ubah klien |
| Edit description | Updates are used in subsequent projects and messages. | Perubahan dipakai di proyek dan pesan berikutnya. |
| Name label | Client name | Nama klien |
| Name example | e.g. Rina & Dimas | Contoh: Rina & Dimas |
| Phone label | WhatsApp number | Nomor WhatsApp |
| Phone example | 0812 3456 7890 | 0812 3456 7890 |
| Phone helper | For example, 0812 3456 7890. For international numbers, start with + and the country code. | Contoh: 0812 3456 7890. Nomor luar negeri diawali + dan kode negara. |
| Social section | Social media (optional) | Media sosial (opsional) |
| Social placeholder desktop | @username or an https:// link | @nama atau tautan https:// |
| Social placeholder mobile | @username or a link | @nama atau tautan |
| Add social link | Add social account | Tambah akun media sosial |
| Remove social link | Remove social account | Hapus akun media sosial |
| Platform accessible name | Social platform {index} | Platform media sosial {index} |
| Account accessible name | {platform} account {index} | Akun {platform} {index} |
| Remove accessible name | Remove {platform} account {index} | Hapus akun {platform} {index} |
| Other platform option | Other | Lainnya |
| Add CTA | Add client | Tambah klien |
| Edit CTA | Save changes | Simpan perubahan |
| Added title | Client added | Klien ditambahkan |
| Added body | {name} can now be selected for a project. | {name} sudah bisa dipilih untuk proyek. |
| Saved title | Client updated | Klien diperbarui |
| Server error body | The client’s saved details haven’t changed. Try again. | Data klien yang tersimpan belum berubah. Coba lagi. |

Instagram, TikTok, Facebook, YouTube, X and WhatsApp are brand names in both languages.

### 6.3 Archive, restore and delete

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Archive action | Archive | Arsipkan |
| Archive success title | Client archived | Klien diarsipkan |
| Archive success body | {name} moved to Archived. | {name} pindah ke Arsip. |
| Restore action | Restore | Pulihkan |
| Restore success | Client restored | Klien dipulihkan |
| Delete dialog title | Delete client “{name}”? | Hapus klien “{name}”? |
| Delete body | Their name, WhatsApp number and social accounts will be permanently deleted. The number can be used by another client. | Nama, nomor WhatsApp, dan akun media sosialnya dihapus permanen. Nomornya bisa dipakai klien lain. |
| Delete CTA | Delete client | Hapus klien |
| Delete blocked title | This client has projects | Klien ini punya proyek |
| Delete blocked body | {name} wasn’t deleted. Archive this client instead. | {name} tidak dihapus. Arsipkan klien ini saja. |
| Delete success | Client deleted | Klien dihapus |

### 6.4 Client validation — includes copy outside `.copy.ts`

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Name empty | Enter the client’s name. | Isi nama klien. |
| Name too long | Use no more than 100 characters. | Gunakan maksimal 100 karakter. |
| Invalid phone | Enter a valid WhatsApp number. | Masukkan nomor WhatsApp yang valid. |
| Number taken | This number is already in use. | Nomor ini sudah dipakai. |
| Named number holder | This number is used by {name}. | Nomor ini dipakai {name}. |
| Archived number holder | This number is used by {name} (archived). | Nomor ini dipakai {name} (diarsipkan). |
| Empty social value | Enter an account or link. | Isi akun atau tautan. |
| Invalid link | Start the link with https://. | Awali tautan dengan https://. |
| Duplicate social account | This account is already listed. | Akun ini sudah ada di daftar. |
| Unknown platform | Choose a platform from the list. | Pilih platform dari daftar. |
| Too many social accounts | Add no more than 10 social accounts. | Tambahkan maksimal 10 akun media sosial. |
| Generic field error | Check this field and try again. | Cek isian ini, lalu coba lagi. |

## 7. Projects, packages and sessions

**Pages:** `{workspace}/projects`, `/projects/completed`, `/projects/cancelled`, `/projects/new`, `/projects/{projectId}`. Sources: `project-copy.copy.ts`, `project-field-error.ts`. Existing project drafts remain supported; this is distinct from the out-of-scope service publication lifecycle.

### 7.1 Project list, tabs and filters

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title and parent | Projects | Proyek |
| List heading | Project list | Daftar proyek |
| Active tab | Active | Aktif |
| Completed tab | Completed | Selesai |
| Cancelled tab | Canceled | Dibatalkan |
| Tabs accessible name | Project status | Status proyek |
| Active count | {count} active projects | {count} proyek aktif |
| Completed count | {count} completed projects | {count} proyek selesai |
| Cancelled count | {count} canceled projects | {count} proyek dibatalkan |
| Create CTA | New project | Proyek baru |
| Mobile create CTA | New | Baru |
| Search label | Search by project title or client name | Cari judul proyek atau nama klien |
| Search results | {count} projects found | {count} proyek ditemukan |
| Project column | Project | Proyek |
| Event column | Shoot | Pemotretan |
| Status column | Status | Status |
| Active empty title | No projects yet | Belum ada proyek |
| Active empty body | Create a project to record the client, service and agreed price. | Buat proyek untuk mencatat klien, layanan, dan harga yang disepakati. |
| Completed empty title | No completed projects yet | Belum ada proyek yang selesai |
| Completed empty body | Projects appear here after final delivery and completion. | Proyek muncul di sini setelah hasil akhir dikirim dan proyek diselesaikan. |
| Cancelled empty title | No canceled projects yet | Belum ada proyek yang dibatalkan |
| Cancelled empty body | Canceled projects appear here with their cancellation reasons. | Proyek yang dibatalkan muncul di sini beserta alasannya. |
| Search empty title | No matching projects | Belum ada proyek yang cocok |
| Search empty body | Try another title or part of the client’s name. | Coba judul lain atau sebagian nama klien. |
| No schedule metadata | No sessions scheduled | Belum ada jadwal sesi |
| Next session metadata | Next session | Sesi berikutnya |
| Last session metadata | Last session | Sesi terakhir |
| Additional sessions | +{count} sessions | +{count} sesi |
| Filter button | Filter | Saring |
| Active-filter badge accessible name | {count} active filters | {count} penyaring aktif |
| Filter sheet title | Filter projects | Saring proyek |
| Filter description | Applies to the {tabName} tab. | Berlaku untuk tab {tabName}. |
| Status filter | Status | Status |
| Status placeholder | All statuses | Semua status |
| Schedule filter | Schedule | Jadwal |
| From date | From | Dari |
| To date | To | Sampai |
| Date placeholder | Choose a date | Pilih tanggal |
| No-schedule switch | Include projects without sessions | Sertakan proyek tanpa jadwal sesi |
| Service filter | Service | Layanan |
| Service placeholder | All services | Semua layanan |
| Client filter | Client | Klien |
| Client placeholder | All clients | Semua klien |
| Archived client result | {name} (archived) | {name} (diarsipkan) |
| Date-range error | The end date must be on or after the start date. | Tanggal akhir harus sama atau setelah tanggal awal. |
| Reset filters | Clear filters | Hapus penyaring |
| Apply filters | Apply | Terapkan |

### 7.2 Create project — `{workspace}/projects/new`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | New project | Proyek baru |
| Subtitle | Choose a client and service, then record what you’ve agreed on. | Pilih klien dan layanan, lalu catat kesepakatan kalian. |
| First section | Client and service | Klien dan layanan |
| Client label | Client | Klien |
| Client placeholder | Find or add a client | Cari atau tambah klien |
| Client result-group label | Clients · {count} matches | Klien · {count} cocok |
| Client result empty | No client matching “{query}” | Tidak ada klien yang cocok dengan “{query}” |
| Create client from search | Add new client “{query}” | Tambah klien baru “{query}” |
| Embedded add-client description | The new client will be selected for this project. | Klien baru langsung dipilih untuk proyek ini. |
| Client metadata | {number} · {count} projects | {number} · {count} proyek |
| Missing client phone | No WhatsApp number yet | Belum ada nomor WhatsApp |
| Service label | Service | Layanan |
| Service placeholder | Choose a service | Pilih layanan |
| Service helper | {category} · Base price {amount} | {category} · Harga dasar {amount} |
| No service title | No active services yet | Belum ada layanan aktif |
| No service body | A project starts from a service in a category. Add both in the Add service dialog. | Proyek dimulai dari layanan dalam kategori. Tambahkan keduanya di dialog Tambah layanan. |
| No service CTA | Add service | Tambah layanan |
| Change-service confirmation | Change service? | Ganti layanan? |
| Change-service body | Your package edits will be lost. The package will be replaced with {serviceName}. | Perubahan isi paketmu akan hilang. Isi paket diganti dengan isi {serviceName}. |
| Change-service confirm | Change service | Ganti layanan |
| Package section | Package details | Isi paket |
| Package description | Copied from {serviceName}. Changes apply only to this project. | Disalin dari {serviceName}. Perubahan hanya berlaku untuk proyek ini. |
| Mobile package description | From {serviceName}. For this project only. | Dari {serviceName}. Hanya untuk proyek ini. |
| Package empty title | This service has no package items yet | Layanan ini belum punya isi paket |
| Package empty body | Add items if needed. They apply only to this project. | Tambahkan item bila perlu. Itemnya hanya berlaku untuk proyek ini. |
| Edit-selection marker | Editing selections | Pilihan edit |
| Print-selection marker | Print selections | Pilihan cetak |
| Details section | Project details | Detail proyek |
| Title label | Project title | Judul proyek |
| Title placeholder | Filled in after you choose a service | Terisi setelah memilih layanan |
| Title example | e.g. {serviceName} — {clientName} | Contoh: {serviceName} — {clientName} |
| Title helper | Created from the service and client names. You can change it. | Dibuat dari nama layanan dan klien. Bisa diubah. |
| Price label | Agreed price | Harga sepakat |
| Price helper | Service base price: {amount} | Harga dasar layanan: {amount} |
| Internal notes | Internal notes | Catatan internal |
| Notes placeholder | Only you can see these notes. | Hanya kamu yang bisa melihat catatan ini. |
| Schedule section | Schedule | Jadwal |
| Schedule helper | Add at least one shoot session to create the project. | Tambahkan minimal satu sesi pemotretan untuk membuat proyek. |
| Schedule empty title | No sessions yet | Belum ada sesi |
| Schedule empty body | Add the date, time and location. You can save a draft without sessions. | Catat tanggal, jam, dan lokasi. Draf bisa disimpan tanpa sesi. |
| Booking-fields section | Booking details | Detail pemesanan |
| Booking-fields description | From {serviceName}. Fields without “optional” are required, including for drafts. | Dari {serviceName}. Kolom tanpa “opsional” wajib diisi, termasuk untuk draf. |
| Field choice placeholder | Choose {fieldName} | Pilih {fieldName} |
| Boolean true | Yes | Ya |
| Boolean false | No | Tidak |
| Save draft CTA | Save draft | Simpan draf |
| Draft pending | Saving draft… | Menyimpan draf… |
| Create CTA | Create project | Buat proyek |
| Create pending | Creating project… | Membuat proyek… |
| Created toast | Project created | Proyek dibuat |
| Created body | {title} is now booked. | {title} sudah dipesan. |
| Draft toast | Draft saved | Draf disimpan |
| Draft body | {title} was saved as a draft. | {title} disimpan sebagai draf. |
| Server error body | Your form entries are still here. Try again. | Isian formulirmu masih ada. Coba lagi. |

### 7.3 Project detail and stage actions — `/projects/{projectId}`

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Info section | Project info | Info proyek |
| Info labels | Client / Service / Agreed price / Internal notes | Klien / Layanan / Harga sepakat / Catatan internal |
| Package description | Copied from {serviceName}. Editable until the shoot starts. | Disalin dari {serviceName}. Bisa diubah sampai pemotretan dimulai. |
| Package description mobile | Editable until the shoot starts. | Bisa diubah sampai pemotretan dimulai. |
| Schedule description | Shoot sessions, ordered by date. | Sesi pemotretan, urut tanggal. |
| Schedule description mobile | Ordered by date. | Urut tanggal. |
| No session before confirmation | Add at least one session before confirming the booking. | Tambahkan minimal satu sesi sebelum mengonfirmasi pemesanan. |
| Booking snapshot description | Copied from {serviceName} when this project was created. | Disalin dari {serviceName} saat proyek dibuat. |
| Locked description | Locked since the shoot started. | Terkunci sejak pemotretan dimulai. |
| Canceled description | This project is canceled and can’t be edited. | Proyek ini dibatalkan dan tidak bisa diubah. |
| Canceled by | Canceled by {name} on {date}. | Dibatalkan oleh {name} pada {date}. |
| Canceled, actor unavailable | Canceled on {date}. | Dibatalkan pada {date}. |
| Cancellation reason | Reason: {reason} | Alasan: {reason} |
| Confirm CTA | Confirm booking | Konfirmasi pemesanan |
| Confirm pending | Confirming booking… | Mengonfirmasi pemesanan… |
| Start CTA | Start shoot | Mulai pemotretan |
| Start pending | Starting shoot… | Memulai pemotretan… |
| Finish CTA | Finish shoot | Selesaikan pemotretan |
| Finish pending | Finishing shoot… | Menyelesaikan pemotretan… |
| Confirmed toast | Booking confirmed | Pemesanan dikonfirmasi |
| Started toast | Shoot started | Pemotretan dimulai |
| Started consequence | Package details and price are now locked. | Isi paket dan harga sekarang terkunci. |
| Finished toast | Shoot finished | Pemotretan selesai |
| Stale status title | The project status has changed | Status proyek sudah berubah |
| Stale status body | The page has reloaded with the latest details. | Halaman dimuat ulang dengan data terbaru. |
| Draft status | Draft | Draf |
| Booked status | Booked | Dipesan |
| Shooting status | Shooting | Pemotretan |
| Post-processing status | Post-production | Pascaproduksi |
| Delivered status | Delivered | Terkirim |
| Completed status | Completed | Selesai |
| Cancelled status | Canceled | Dibatalkan |

### 7.4 Edit info, package items and booking values — project detail

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Edit info title/action | Edit project info | Ubah info proyek |
| Edit info mobile | Edit | Ubah |
| Edit info description | Update the project title, agreed price and notes. | Perbarui judul, harga sepakat, dan catatan proyek. |
| Locked-price description | You can still edit the title and notes. | Judul dan catatan masih bisa diubah. |
| Info saved | Project info saved | Info proyek disimpan |
| Price locked refusal | The agreed price is locked | Harga sepakat sudah terkunci |
| Canceled refusal | This project has been canceled | Proyek ini sudah dibatalkan |
| Add-item title/action | Add item | Tambah item |
| Add-item description | This item is added to this project only. | Item hanya ditambahkan ke proyek ini. |
| Edit-item title | Edit value · {name} | Ubah nilai · {name} |
| Edit-item description | Changes apply only to this project. The service stays unchanged. | Perubahan hanya berlaku untuk proyek ini. Layanan tidak berubah. |
| Item picker label | Item | Item |
| Item picker placeholder | Choose an item | Pilih item |
| Item picker helper | Active items not already in this project. | Item aktif yang belum ada di proyek ini. |
| Quantity label | Quantity | Jumlah |
| Unit helper | Unit: {unit} | Satuan: {unit} |
| Range minimum | Minimum | Minimum |
| Range maximum | Maximum | Maksimum |
| Item menu accessible name | Actions for item {name} | Tindakan untuk item {name} |
| Remove-item title | Remove {name}? | Hapus {name}? |
| Remove-item body | The item is removed from this project. The service stays unchanged. | Item dihapus dari proyek ini. Layanan tidak berubah. |
| Remove-item CTA | Remove item | Hapus item |
| Edit-fields title | Edit booking fields | Ubah kolom pemesanan |
| Edit-fields description | Update this project’s field values. Field names and types stay unchanged. | Perbarui nilai kolom proyek ini. Nama dan tipe kolom tidak berubah. |
| Locked-package title | Package details can no longer be edited | Isi paket tidak bisa diubah lagi |
| Locked-package body | The shoot has started. The latest details have been loaded. | Pemotretan sudah dimulai. Data terbaru sudah dimuat. |

### 7.5 Session dialogs — project creation and detail

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add session title/action | Add session | Tambah sesi |
| Edit session title/action | Edit session | Ubah sesi |
| Creation dialog description | This session is saved with the project. | Sesi disimpan bersama proyek. |
| Detail dialog description | Changes are saved immediately. | Perubahan langsung disimpan. |
| Session name | Session name | Nama sesi |
| Session example | e.g. Ceremony, Reception, Family photos | Contoh: Akad, Resepsi, Foto keluarga |
| Date label | Date | Tanggal |
| Date placeholder | Choose a date | Pilih tanggal |
| Start time | Start time | Jam mulai |
| End time | End time | Jam selesai |
| Location | Location | Lokasi |
| Location placeholder | Address or venue name | Alamat atau nama tempat |
| Session menu accessible name | Actions for session {sessionName} | Tindakan untuk sesi {sessionName} |
| Delete-session title | Delete session {sessionName}? | Hapus sesi {sessionName}? |
| Delete-session body | The session will be removed from this project’s schedule. | Sesi dihapus dari jadwal proyek ini. |
| Delete-session team consequence | This session has {count} team members. Their assignments will also be deleted. | Sesi ini punya {count} anggota tim. Penugasannya ikut dihapus. |
| Delete-session CTA | Delete session | Hapus sesi |
| Last-session constraint | A booked project needs at least one session. | Proyek yang sudah dipesan butuh minimal satu sesi. |

### 7.6 Cancel project and delete draft

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| WhatsApp menu action | Chat on WhatsApp | Kirim pesan lewat WhatsApp |
| Missing-phone action | Add WhatsApp number | Tambah nomor WhatsApp |
| Future template menu group | Send to client | Kirim ke klien |
| Cancel menu action | Cancel project | Batalkan proyek |
| Cancel dialog title | Cancel project? | Batalkan proyek? |
| Cancel description | The project moves to Canceled and can’t be edited again. Published galleries are also archived, so clients can no longer open them. | Proyek pindah ke Dibatalkan dan tidak bisa diubah lagi. Galeri yang dipublikasikan ikut diarsipkan, jadi klien tidak bisa membukanya lagi. |
| Standalone gallery consequence | Published galleries are archived, so clients can no longer open them. | Galeri yang dipublikasikan ikut diarsipkan, jadi klien tidak bisa membukanya lagi. |
| Reason label | Cancellation reason | Alasan pembatalan |
| Reason example | e.g. The client canceled after a schedule change | Contoh: Klien membatalkan karena jadwal berubah |
| Cancel confirmation CTA | Cancel project | Batalkan proyek |
| Keep project/back | Go back | Kembali |
| Canceled toast | Project canceled | Proyek dibatalkan |
| Canceled body | {title} moved to the Canceled tab. | {title} pindah ke tab Dibatalkan. |
| Delete-draft action | Delete draft | Hapus draf |
| Delete-draft title | Delete draft “{title}”? | Hapus draf “{title}”? |
| Delete-draft description | The draft, package details, sessions and booking fields will be permanently deleted. | Draf, isi paket, jadwal, dan kolom pemesanannya dihapus permanen. |
| Draft team consequence | Team assignments will also be deleted. | Penugasan tim ikut dihapus. |
| Deleted toast | Draft deleted | Draf dihapus |
| Deleted body | {title} was deleted. | {title} sudah dihapus. |

### 7.7 Project validation — includes copy outside `.copy.ts`

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Client required | Choose a client. | Pilih klien. |
| Client archived | This client is archived. Choose another client. | Klien ini diarsipkan. Pilih klien lain. |
| Service required | Choose a service. | Pilih layanan. |
| Service inactive | This service is no longer active. Choose another service. | Layanan ini sudah tidak aktif. Pilih layanan lain. |
| Title empty | Enter a project title. | Isi judul proyek. |
| Title too long | Use no more than 100 characters for the title. | Judul proyek maksimal 100 karakter. |
| Notes too long | Use no more than 2,000 characters for notes. | Catatan maksimal 2.000 karakter. |
| Price empty | Enter the agreed price. | Isi harga sepakat. |
| Price negative | The price can’t be negative. | Harga tidak boleh negatif. |
| Fractional rupiah | Enter the price in whole rupiah, without decimals. | Isi harga dalam rupiah bulat, tanpa desimal. |
| Price too large | The maximum price is {maxPrice}. | Harga maksimal {maxPrice}. |
| Session required | Add at least one session. | Tambahkan minimal satu sesi. |
| Session name empty | Enter a session name. | Isi nama sesi. |
| Session name too long | Use no more than 100 characters for the session name. | Nama sesi maksimal 100 karakter. |
| Date empty | Choose a session date. | Pilih tanggal sesi. |
| Date invalid | Choose a valid date. | Pilih tanggal yang valid. |
| End without start | Enter the start time first. | Isi jam mulai dulu. |
| End not after start | The end time must be after the start time. | Jam selesai harus setelah jam mulai. |
| Location too long | Use no more than 200 characters for the location. | Lokasi maksimal 200 karakter. |
| Invalid session team | Review this session’s team members and roles. | Cek anggota dan peran tim sesi ini. |
| Item required | Choose an item. | Pilih item. |
| Item already included | This item is already in the project. | Item ini sudah ada di proyek. |
| Item inactive | This item is no longer active. Choose another item. | Item ini sudah tidak aktif. Pilih item lain. |
| Invalid quantity | Enter a valid number. | Isi angka yang valid. |
| Negative quantity | Enter zero or a positive number. | Isi nol atau angka positif. |
| Quantity precision | Use no more than 2 decimal places. | Gunakan maksimal 2 angka desimal. |
| Quantity too large | This number is too large. | Angkanya terlalu besar. |
| Whole quantity | Enter a whole number. | Isi angka bulat. |
| Range constraint | The maximum must be at least the minimum. | Maksimum harus sama atau lebih dari minimum. |
| Cancellation reason required | Enter a cancellation reason. It’s required after the shoot starts. | Isi alasan pembatalan. Wajib setelah pemotretan dimulai. |
| Cancellation reason too long | Use no more than 500 characters for the reason. | Alasan maksimal 500 karakter. |
| Required booking value | Fill in {fieldName}. | Isi {fieldName}. |
| Booking value too long | Use no more than 200 characters for {fieldName}. | {fieldName} maksimal 200 karakter. |
| Invalid booking option | Choose one of the listed options. | Pilih salah satu pilihan yang tersedia. |
| Invalid booking value | Enter a valid value. | Masukkan nilai yang valid. |
| Unclassified generic field error | Check this field and try again. | Cek isian ini, lalu coba lagi. |

The final generic error intentionally avoids assuming every field is numeric. `{maxPrice}` is the existing IDR 999,999,999,999 cap, formatted for the active locale; numeric policy still requires verification.

## 8. Team members, roles and session assignments

**Pages:** `{workspace}/team`, `/team/archived`, `/team/roles`. Assignment dialogs appear inside project creation/detail, not a new team-member detail route. Sources: `team-copy.copy.ts`, assignment sections of `project-copy.copy.ts`, seeded team roles.

### 8.1 Member list and dialogs

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| List title | Team members | Anggota tim |
| Tabs accessible name | Team sections | Bagian tim |
| Active tab | Active | Aktif |
| Archived tab | Archived | Arsip |
| Roles tab | Roles | Peran |
| Active count | {count} active members | {count} anggota aktif |
| Archived count | {count} archived members | {count} anggota diarsipkan |
| Member column | Member | Anggota |
| Phone column | WhatsApp | WhatsApp |
| Roles column | Roles | Peran |
| Search label | Search team members | Cari anggota tim |
| Search desktop | Search by name or WhatsApp number | Cari nama atau nomor WhatsApp |
| Search mobile | Search by name or number | Cari nama atau nomor |
| Search results | {count} matching members | {count} anggota cocok |
| No-results title | No matching members | Belum ada anggota yang cocok |
| No-results body | Try another name or WhatsApp number. | Coba nama lain atau nomor WhatsApp. |
| Active empty title | No team members yet | Belum ada anggota tim |
| Active empty body | Add freelancers you work with, then assign them to project sessions. | Catat pekerja lepas yang kamu ajak, lalu tugaskan di jadwal proyek. |
| Archive empty title | No archived members yet | Belum ada anggota di arsip |
| Archive empty body | Archived members appear here. | Anggota yang diarsipkan muncul di sini. |
| Add CTA/title | Add member | Tambah anggota |
| Edit dialog title | Edit member | Ubah anggota |
| Dialog description | A freelancer you can assign to project sessions. | Pekerja lepas yang bisa kamu tugaskan di jadwal proyek. |
| Name label | Name | Nama |
| Name placeholder | Full name | Nama lengkap |
| Phone label | WhatsApp number | Nomor WhatsApp |
| Phone placeholder | 0812 3456 7890 | 0812 3456 7890 |
| Phone helper | e.g. 0812 3456 7890 | Contoh: 0812 3456 7890 |
| Email label | Email | Email |
| Email placeholder | name@email.com | nama@email.com |
| Roles label | Roles | Peran |
| Roles placeholder | Choose roles | Pilih peran |
| Roles helper | Choose more than one if needed. You can also add a role here. | Bisa pilih lebih dari satu. Peran baru juga bisa ditambahkan di sini. |
| Create role action | Add new role | Tambah peran baru |
| Added toast | Member added | Anggota ditambahkan |
| Added body | {name} can now be assigned to project sessions. | {name} sudah bisa ditugaskan di jadwal proyek. |
| Saved toast | Member updated | Anggota diperbarui |

### 8.2 Archive/delete members and manage roles

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Archived toast | {name} archived | {name} diarsipkan |
| Archived body | Their assignments are kept. | Penugasannya tetap tersimpan. |
| Restored toast | {name} restored | {name} dipulihkan |
| Delete member title | Delete member “{name}”? | Hapus anggota “{name}”? |
| Delete member body | Their name, WhatsApp number, email and roles will be permanently deleted. | Nama, nomor WhatsApp, email, dan perannya dihapus permanen. |
| Blocked member title | {name} can’t be deleted | {name} tidak bisa dihapus |
| Blocked member body | This member has assignments. Archive them instead. | Anggota ini punya penugasan. Arsipkan saja. |
| Deleted member toast | {name} deleted | {name} dihapus |
| Role-list heading | Roles | Peran |
| Role count desktop | {count} roles · choose when adding a member | {count} peran · dipilih saat menambah anggota |
| Role count mobile | {count} roles | {count} peran |
| Role column | Role | Peran |
| Usage column | Used by | Dipakai oleh |
| Role usage | {count} members | {count} anggota |
| Role unused | Not used yet | Belum dipakai |
| Add role title/action | Add role | Tambah peran |
| Edit role title/action | Edit role | Ubah peran |
| Role dialog description | Choose roles when adding a member. | Peran dipilih saat menambah anggota. |
| Role name | Role name | Nama peran |
| Role empty title | No roles yet | Belum ada peran |
| Role empty body | Add a role so it can be selected for a team member. | Tambahkan peran agar bisa dipilih untuk anggota tim. |
| Role added | Role added | Peran ditambahkan |
| Role saved | Role updated | Peran diperbarui |
| Role deleted | Role deleted | Peran dihapus |
| Delete-role title | Delete role “{name}”? | Hapus peran “{name}”? |
| Delete-role body | This role will be removed from the list. | Peran ini dihapus dari daftar. |
| Blocked-role title | Role {name} can’t be deleted | Peran {name} tidak bisa dihapus |
| Blocked-role body | This role is still used by {count} members. | Peran ini masih dipakai {count} anggota. |
| Default role | Photographer | Fotografer |
| Default role | Videographer | Videografer |
| Default role | Assistant | Asisten |

### 8.3 Session assignment — project session controls

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add team action | Add team | Tambah tim |
| Manage team action | Manage team | Atur tim |
| Accessible add action | Add team for {sessionName} | Tambah tim untuk {sessionName} |
| Team group announcement | {sessionName} team: {count} members | Tim {sessionName}: {count} anggota |
| Avatar description | {name} · {role} | {name} · {role} |
| Assignment dialog title | Add member · {sessionName} | Tambah anggota · {sessionName} |
| Member label | Member | Anggota |
| Member placeholder | Choose a member | Pilih anggota |
| Member helper | Active members not already assigned to this session. | Anggota aktif yang belum ditugaskan di sesi ini. |
| Role label | Role | Peran |
| Role placeholder | Choose a role | Pilih peran |
| Role helper | Roles held by {name}. | Peran yang dimiliki {name}. |
| Assignment empty title | No active team members yet | Belum ada anggota tim aktif |
| Assignment empty body | Add a member on the Team page, then return here. | Tambahkan anggota di halaman Tim dulu, lalu kembali ke sini. |
| Assignment empty action | Open team | Buka tim |
| Assigned success | Member assigned | Anggota ditugaskan |
| Assigned body | {name} is assigned to {sessionName} as {role}. | {name} bertugas di {sessionName} sebagai {role}. |
| Session-form team label | Team | Tim |
| Session-form team helper | Choose members and roles for this session. You can update them later in Manage team. | Pilih anggota dan peran di sesi ini. Bisa diubah nanti lewat Atur tim. |
| Session-form member label | Team member | Anggota tim |
| Session-form role label | Role in this session | Peran di sesi ini |
| Session-form list accessible name | This session’s team | Tim sesi ini |
| Manage-team title | Team · {sessionName} | Tim · {sessionName} |
| Manage-team list accessible name | Team for {sessionName} | Tim {sessionName} |
| Archived member marker | (archived) | (diarsipkan) |
| Canceled-project restriction | This project is canceled. Its team can’t be changed. | Proyek ini dibatalkan. Timnya tidak bisa diubah. |
| Remove-assignment action | Remove from session | Hapus dari sesi |
| Remove-assignment title | Remove {name} from {sessionName}? | Hapus {name} dari {sessionName}? |
| Remove-assignment body | This assignment is deleted. {name} stays in your team list. | Penugasan ini dihapus. {name} tetap ada di daftar tim. |
| Removed toast | Member removed from session | Anggota dihapus dari sesi |
| Removed body | {name} is no longer assigned to {sessionName}. | {name} tidak lagi bertugas di {sessionName}. |

### 8.4 Member, role and assignment validation

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Member name empty | Enter the member’s name. | Isi nama anggota. |
| Member name too long | Use no more than 100 characters. | Gunakan maksimal 100 karakter. |
| WhatsApp required | Enter a WhatsApp number. | Isi nomor WhatsApp. |
| WhatsApp invalid | Enter a valid WhatsApp number. | Masukkan nomor WhatsApp yang valid. |
| Number used | This number is used by {name}. | Nomor ini dipakai {name}. |
| Number used by archived member | This number is used by {name} (archived). | Nomor ini dipakai {name} (diarsipkan). |
| Email invalid | Enter a valid email address. | Masukkan alamat email yang valid. |
| Member roles required | Choose at least one role. | Pilih minimal satu peran. |
| Role name empty | Enter a role name. | Isi nama peran. |
| Role name too long | Use no more than 50 characters. | Gunakan maksimal 50 karakter. |
| Duplicate role | This role already exists. | Peran ini sudah ada. |
| Already assigned | {name} is already assigned to this session. | {name} sudah ditugaskan di sesi ini. |
| Archived member assignment | {name} is archived. Choose another member. | {name} diarsipkan. Pilih anggota lain. |
| Role not held | {name} no longer has this role. Choose another role. | {name} tidak punya peran ini lagi. Pilih peran lain. |

## 9. Photo sources

**Page:** `{workspace}/photo-sources`; add, rename and delete dialogs. Source: `source-copy.copy.ts`. Provider brands stay unchanged. The folder guide describes mapping subfolders to package items; it names no required folder.

### 9.1 Source list and Google Drive guide

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Photo sources | Sumber foto |
| List heading | Sources | Daftar sumber |
| List description | Choose a source when creating a gallery. Inactive sources can’t be selected. | Pilih sumber saat membuat galeri. Sumber nonaktif tidak bisa dipilih. |
| Mobile description | Choose a source when creating a gallery. | Pilih sumber saat membuat galeri. |
| Loading announcement | Loading photo sources… | Memuat sumber foto… |
| Add CTA | Add source | Tambah sumber |
| Google Drive description | Link-shared photo folders. Shutrly doesn’t edit the files. | Folder foto yang dibagikan lewat tautan. Shutrly tidak mengubah file. |
| Custom-URL provider label, unavailable option | Custom link | Tautan khusus |
| Active status | Active | Aktif |
| Inactive status | Inactive | Nonaktif |
| Unavailable-provider status | Coming soon | Segera hadir |
| Empty title | No photo sources yet | Belum ada sumber foto |
| Empty body | Add Google Drive to link photos to your galleries. | Tambahkan Google Drive agar foto bisa ditautkan ke galeri. |
| Guide title | Set up your Google Drive folder | Siapkan folder Google Drive |
| Guide description | Share a Drive folder by link, then connect it to a gallery. Shutrly reads it without changing your files. | Bagikan folder Drive lewat tautan, lalu hubungkan ke galeri. Shutrly membacanya tanpa mengubah filemu. |
| Guide mobile description | Paste the folder link when setting up a gallery. | Tempel tautan folder saat menyiapkan galeri. |
| Step 1 | Start with a main folder for each project. | Mulai dengan satu folder utama untuk tiap proyek. |
| Step 2 | Put photos for selection in the main folder or session subfolders. | Taruh foto pilihan di folder utama atau subfolder sesi. |
| Step 3 · Approved (Owner, 2026-10-12) | Later, map any subfolder to a package item on the gallery page. Files in mapped subfolders are final files; unmapped photos stay available for selection. | Nanti, petakan subfolder apa pun ke item paket di halaman galeri. File di subfolder yang dipetakan menjadi hasil akhir; foto yang belum dipetakan tetap tersedia untuk dipilih. |
| Step 4 | Share the main folder: General access → Anyone with the link → Viewer. | Bagikan folder utama: Akses umum → Siapa saja yang memiliki link → Pelihat. |
| Folder-tree accessible name | Example folder structure | Contoh struktur folder |
| Root example name | Rina & Dimas | Rina & Dimas |
| Root example annotation | Selection photos or session subfolders | Foto pilihan atau subfolder sesi |
| Edited example label · Approved (Owner, 2026-10-12) | Hasil Edit → mapped to Edited photos later | Hasil Edit → dipetakan ke Hasil edit nanti |
| Printed example label · Approved (Owner, 2026-10-12) | Cetak → mapped to Printed photos later | Cetak → dipetakan ke Foto cetak nanti |
| Public-link warning title | Drive links bypass the gallery password | Tautan Drive melewati kata sandi galeri |
| Public-link warning body | Anyone with the Drive folder link can view its photos directly without the gallery password. Share only the Shutrly gallery link with clients. | Siapa pun yang punya tautan folder Drive bisa melihat fotonya langsung tanpa kata sandi galeri. Ke klien, bagikan hanya tautan galeri Shutrly. |
| Warning mobile body | Anyone with the Drive link can view the photos directly. Share only the Shutrly gallery link with clients. | Siapa pun yang punya tautan Drive bisa melihat fotonya langsung. Ke klien, bagikan hanya tautan galeri Shutrly. |

Drive folder classification follows BR-GAL-007: a file inside a subfolder mapped to a package item is a final file (the longest mapped folder above it wins); other photos, including ordinary session subfolders, are selectable photos. No folder name is special. Sync occurs when you link a folder or request it, not continuously or on a schedule.

Google Drive sharing labels refer to Drive’s own language. The Indonesian `link` in step 4 is its exact setting name; do not rename the external setting to match display terminology. Folder names belong to the photographer; no name is special.

### 9.2 Source dialogs, notifications and validation

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Add-dialog title | Add photo source | Tambah sumber foto |
| Add description | Add a Google Drive source for your gallery folders. Other providers aren’t available yet. | Tambahkan sumber Google Drive untuk folder galerimu. Penyedia lain belum tersedia. |
| Provider label | Provider | Penyedia |
| Source-name label | Source name | Nama sumber |
| Name placeholder | e.g. Google Drive Archive | Contoh: Arsip Google Drive |
| Name helper | Shown when choosing a gallery source. | Muncul saat memilih sumber galeri. |
| Rename title | Rename source | Ganti nama sumber |
| Rename description | The new name is used throughout this workspace. | Nama baru dipakai di seluruh ruang kerja ini. |
| Delete title | Delete source “{name}”? | Hapus sumber “{name}”? |
| Delete body | This source is removed from the workspace. Google Drive folders and photos stay unchanged. | Sumber ini dihapus dari ruang kerja. Folder dan foto di Google Drive tidak berubah. |
| Delete CTA | Delete source | Hapus sumber |
| In-use refusal | A gallery uses this source. Deactivate it instead. | Sumber ini dipakai galeri. Nonaktifkan saja. |
| Added title | Source added | Sumber ditambahkan |
| Added body | {name} can now be selected for a gallery. | {name} sudah bisa dipilih untuk galeri. |
| Renamed title | Source renamed | Nama sumber diperbarui |
| Renamed body | {name} has been updated. | {name} sudah diperbarui. |
| Deactivated title | Source deactivated | Sumber dinonaktifkan |
| Deactivated body | {name} can’t be selected for new galleries. | {name} tidak bisa dipilih untuk galeri baru. |
| Activated title | Source activated | Sumber diaktifkan |
| Activated body | {name} is active again. | {name} sudah aktif lagi. |
| Deleted title | Source deleted | Sumber dihapus |
| Deleted body | {name} was deleted. | {name} sudah dihapus. |
| Save failure body | Your saved sources haven’t changed. Try again. | Data sumber yang tersimpan belum berubah. Coba lagi. |
| Name empty | Enter a source name. | Isi nama sumber. |
| Name too long | Use no more than 60 characters. | Gunakan maksimal 60 karakter. |
| Name taken | This name is already used in this workspace. | Nama ini sudah dipakai di ruang kerja ini. |
| Provider unavailable | This provider isn’t available yet. | Penyedia ini belum tersedia. |

## 10. Gallery management — Owner

**Pages:** gallery card on `{workspace}/projects/{projectId}` and management page `{workspace}/projects/{projectId}/gallery`. Sources: `gallery-copy.copy.ts`, gallery summary helpers and existing feature rules. Sharing with clients is a later feature; avoid implying the current Owner page already sends messages.

### 10.1 Project gallery card and status

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Section/page title | Gallery | Galeri |
| Card description | Project photos from your Google Drive folder. | Foto proyek dari folder Google Drive kamu. |
| SUPERSEDED (F-27 iteration 5): No-gallery title| No gallery yet | Belum ada galeri |
| SUPERSEDED (F-27 iteration 5): No-gallery body| Create a password-protected gallery, then link the project’s Google Drive folders. | Buat galeri dengan kata sandi, lalu tautkan folder Google Drive proyek ini. |
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): No-gallery CTA| Create gallery | Buat galeri |
| Draft-project title | Gallery is created when the project is booked | Galeri dibuat saat proyek dibooking |
| Draft-project body | Confirm the booking first; the gallery and its password are created automatically. | Konfirmasi booking dulu; galeri dan kata sandinya dibuat otomatis. |
| Canceled-project title | Gallery unavailable | Galeri tidak tersedia |
| Canceled-project body | This project is canceled, so a gallery can’t be created. | Proyek ini dibatalkan, jadi galeri tidak bisa dibuat. |
| Manage CTA | Manage gallery | Kelola galeri |
| Manage mobile CTA | Manage | Kelola |
| View CTA | View gallery | Lihat galeri |
| Status label | Status | Status |
| Password label | Password | Kata sandi |
| Sources label | Sources | Sumber |
| Photos label | Photos | Foto |
| Combined label | Sources · Photos | Sumber · Foto |
| Expiry label | Expiry | Kedaluwarsa |
| Draft status | Draft | Draf |
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): Published status| Published | Dipublikasikan |
| Expired status | Expired | Kedaluwarsa |
| Archived status | Archived | Diarsipkan |
| Folder count | {count} folders | {count} folder |
| No folders | No folders yet | Belum ada folder |
| Photo summary | {proofCount} selection photos · {editedCount} edited photos · {printCount} print photos | {proofCount} foto pilihan · {editedCount} hasil edit · {printCount} foto cetak |
| Missing count | {count} missing | {count} hilang |
| Summary with missing photos | {proofCount} selection photos ({missingCount} missing) · {editedCount} edited photos · {printCount} print photos | {proofCount} foto pilihan ({missingCount} hilang) · {editedCount} hasil edit · {printCount} foto cetak |
| No expiry | No expiry | Tanpa kedaluwarsa |
| Expiry date | Expires on {date} | Kedaluwarsa pada {date} |
| Expired date | Expired since {date} | Kedaluwarsa sejak {date} |
| Past-date badge | {date} (expired) | {date} (kedaluwarsa) |
| Draft expiry duration | {count} days after publishing | {count} hari setelah dipublikasikan |
| Copy password CTA | Copy password | Salin kata sandi |
| Password copied | Password copied | Kata sandi disalin |
| Clipboard failed title | Password couldn’t be copied | Kata sandi belum tersalin |
| Clipboard failed body | Copy the password manually. | Salin kata sandi secara manual. |
| Failed-folders card title | {count} folders couldn’t be synced | {count} folder belum bisa disinkronkan |
| Failed-folders card body | {names} couldn’t be read. Open the gallery for details. | {names} belum bisa dibaca. Buka galeri untuk melihat penyebabnya. |
| P2 booked, no folder, AC-GFL-007 | No folder yet | Belum ada folder |
| P2 body | The gallery is ready with a password. Add a Google Drive folder with this project’s photos, then send the link to the client. | Galeri sudah siap dengan kata sandi. Tambahkan folder Google Drive berisi foto proyek ini, lalu kirim link ke klien. |
| P6 chip, A-3 | Closed | Ditutup |
| P6 summary title | Project cancelled, gallery closed | Proyek dibatalkan, galeri ditutup |
| *Kirim link ke klien* button, AC-GFL-020, shown on P3/P4 and G2 | Send link to client | Kirim link ke klien |
| G1 header meta, AC-GFL-001 | {title} · No folder yet · No expiry | {title} · Belum ada folder · Tanpa kedaluwarsa |
| G4 Alert body, AC-GFL-016 | The client can no longer open the gallery. Photos, folders and the client’s selections stay saved and can only be viewed. | Klien tidak bisa membuka galeri lagi. Foto, folder dan pilihan klien tetap tersimpan dan hanya bisa dilihat. |

Client-dependent visibility and sharing rows describe the intended F-10–F-15 behavior. They must not be presented as usable client access while those features are unavailable; publishing the Owner gallery alone does not deliver the complete client journey.

The missing-count summary replaces word-based `.replace(" proof", …)` processing with a whole-message editorial contract; implementation is still pending.

### 10.2 Create gallery and client-access settings

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): Create-dialog title| Create gallery | Buat galeri |
| Access description | Clients use the gallery link and this password to open the gallery. | Klien membuka galeri dengan tautan dan kata sandi ini. |
| Access-limit note; beside access settings and public-link warnings | The password controls access to the Shutrly gallery. Direct Drive links and saved image URLs may still open outside Shutrly. | Kata sandi membatasi akses ke galeri Shutrly. Tautan Drive dan alamat gambar yang sudah disimpan bisa tetap dibuka di luar Shutrly. |
| Future sharing helper, only when sharing is implemented | The password is filled in when you prepare a gallery-sharing message. | Kata sandi terisi saat kamu menyiapkan pesan untuk membagikan galeri. |
| Password label | Gallery password | Kata sandi galeri |
| Password helper | Generated for you. You can change it to 6–64 characters and view it on this page. | Dibuat otomatis. Bisa diganti dengan 6–64 karakter dan dilihat di halaman ini. |
| Regenerate action | Generate again | Buat ulang |
| Expiry label | Expiry | Kedaluwarsa |
| No-expiry option | No expiry | Tanpa kedaluwarsa |
| Date-expiry option | Until a date | Sampai tanggal |
| Duration option | For a number of days | Selama beberapa hari |
| Date label | Expiry date | Tanggal kedaluwarsa |
| Date helper | The gallery expires at the end of that day. You can change it later. | Galeri kedaluwarsa di akhir hari itu. Bisa diubah nanti. |
| Duration label | Number of days | Jumlah hari |
| SUPERSEDED (F-27 iteration 5): Draft-duration helper| Counted from publishing. You can change it later. | Dihitung sejak galeri dipublikasikan. Bisa diubah nanti. |
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): Create CTA| Create gallery | Buat galeri |
| SUPERSEDED (F-27 iteration 5): Created title| Gallery created | Galeri dibuat |
| Created body | Add a Google Drive folder to get started. | Tambahkan folder Google Drive untuk mulai. |
| Access section title | Client access | Akses klien |
| Rotate action | Change password | Ganti kata sandi |
| Rotate mobile action | Change | Ganti |
| Expiry action | Change expiry | Ubah kedaluwarsa |

### 10.3 Folder list, linking and public-link warnings

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Sources section | Photo sources | Sumber foto |
| Sources description · Owner 2026-10-19, design wording | Google Drive folders shared as “Anyone with the link”. | Folder Google Drive yang dibagikan sebagai “Siapa saja yang memiliki link”. |
| Empty title | No folders yet | Belum ada folder |
| Empty body · Approved (Owner, 2026-10-12) | No folder yet. Add a Google Drive folder with this project’s photos; then you can send the gallery link to the client. | Belum ada folder. Tambahkan folder Google Drive berisi foto proyek ini; setelah itu kamu bisa mengirim link galeri ke klien. |
| Empty body mobile · REMOVED (Owner 2026-10-19, unused; no key in the code) | ~~Link the project’s Google Drive folder.~~ | ~~Tautkan folder Google Drive proyek ini.~~ |
| Add-folder title/action | Add folder | Tambah folder |
| Add description · Approved (Owner, 2026-10-12) | Photos stay available for selection unless their subfolder is mapped to a package item. Mapped files are final files. | Foto tetap tersedia untuk dipilih kecuali subfoldernya dipetakan ke item paket. File yang dipetakan menjadi hasil akhir. |
| Source label | Source | Sumber |
| Source helper | Active sources only. | Hanya sumber aktif. |
| Folder-link label | Google Drive folder link | Tautan folder Google Drive |
| Folder-link placeholder | https://drive.google.com/drive/folders/… | https://drive.google.com/drive/folders/… |
| Folder-link helper | Share the folder with “Anyone with the link”. | Bagikan folder sebagai “Siapa saja yang memiliki link”. |
| Custom label field | Label | Label |
| Label example | e.g. Graduation session | Contoh: Sesi wisuda |
| Label helper | Leave blank to use the Drive folder name. | Kosongkan untuk memakai nama folder dari Drive. |
| Public-link warning title | Drive links bypass the gallery password | Tautan Drive melewati kata sandi galeri |
| Public-link warning body | Anyone with the folder link can view the photos directly. Share the gallery link with clients, not the Drive link. | Siapa pun yang punya tautan folder bisa melihat fotonya langsung. Bagikan tautan galeri ke klien, bukan tautan Drive. |
| Reused-folder warning title | Another project uses this folder | Folder ini dipakai proyek lain |
| Reused-folder warning body | This folder is also linked to {projects}. Clients of both projects may see the same photos. | Folder ini juga tertaut ke {projects}. Klien kedua proyek bisa melihat foto yang sama. |
| Reused-folder confirmation | Add anyway | Tetap tambahkan |
| Folder added toast | Folder added | Folder ditambahkan |
| Folder accessible menu | Actions for {name} | Tindakan untuk {name} |
| Pre-sync fallback name | Google Drive folder | Folder Google Drive |
| Open external folder | Open in Google Drive | Buka di Google Drive |
| Open external folder mobile | Open in Drive | Buka di Drive |
| P2 action | Add Drive folder | Tambah folder Drive |

### 10.4 Sync progress, results and failures

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Sync action | Sync | Sinkronkan |
| Sync-all action | Sync all | Sinkronkan semua |
| Pending action | Syncing… | Menyinkronkan… |
| Queued folder | Waiting… | Menunggu giliran… |
| Running folder progress | Syncing… {done} of {total} folders | Menyinkronkan… {done} dari {total} folder |
| Success chip | Synced | Disinkronkan |
| Running chip | Syncing | Menyinkronkan |
| Failed chip | Failed | Gagal |
| Never-synced chip | Not synced yet | Belum disinkronkan |
| Removed chip | Unlinked | Dilepas |
| Archived chip | Archived | Diarsipkan |
| Last sync short | Last synced {date} | Terakhir disinkronkan {date} |
| Synced time | Synced {date} | Disinkronkan {date} |
| Removed-folder metadata | Unlinked {date} · {count} photos hidden from clients | Dilepas {date} · {count} foto disembunyikan dari klien |
| Selection count | {count} selection photos | {count} foto pilihan |
| Edited count | {count} edited photos | {count} hasil edit |
| Print count | {count} print photos | {count} foto cetak |
| Ignored count | {count} ignored | {count} diabaikan |
| Excessive-depth count | {count} folders exceed the depth limit | {count} folder melewati batas kedalaman |
| Incomplete-sync message | Sync stopped before finishing. | Sinkronisasi berhenti sebelum selesai. |
| Private/unreadable folder | Share the folder with “Anyone with the link”, then sync again. | Bagikan folder sebagai “Siapa saja yang memiliki link”, lalu sinkronkan lagi. |
| Drive rate limited | Google Drive is limiting requests. Sync couldn’t finish. Try again later. | Google Drive sedang membatasi permintaan. Sinkronisasi belum selesai. Coba lagi nanti. |
| Drive unavailable | Google Drive can’t be reached. Sync couldn’t finish. Try again later. | Google Drive belum bisa dihubungi. Sinkronisasi belum selesai. Coba lagi nanti. |
| Folder too large | This folder is too large to sync. Split it into smaller folders, then add them. | Folder ini terlalu besar untuk disinkronkan. Pecah menjadi beberapa folder, lalu tambahkan lagi. |
| Completed title | Sync complete | Sinkronisasi selesai |
| Completed body | {count} folders synced. | {count} folder disinkronkan. |
| Failed title | Sync failed | Sinkronisasi gagal |
| Failed folder names | Couldn’t read {names}. | {names} belum bisa dibaca. |
| P3 summary line | {count, plural, one {# folder} other {# folders}} · syncing {done} of {total} folders | {count, plural, other {# folder}} · menyinkronkan {done} dari {total} folder |
| P4 failed folder, count | {count} folder failed to sync | {count} folder gagal disinkronkan |

A failed multi-step sync may have already saved earlier steps. These error messages do not promise rollback or that stored metadata is unchanged. Files in Google Drive are not edited by Shutrly (ADR-019).

### 10.5 Photos, folder browsing and previews

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Photos section | Photos | Foto |
| Empty description | Photos appear after syncing, ordered by filename. | Foto muncul setelah sinkronisasi, urut nama file. |
| Mobile ordering note | Ordered by filename. | Urut nama file. |
| Empty title | No photos yet | Belum ada foto |
| Empty body · Owner 2026-10-19, design wording | Photos appear after the Google Drive folder is linked and synced. | Foto muncul setelah folder Google Drive ditautkan dan disinkronkan. |
| Preview description | The first 8 photos. View all to browse folders, search and preview photos. | Cuplikan 8 foto pertama. Buka semua untuk menjelajah folder, mencari, dan melihat pratinjau. |
| Preview mobile description | A preview of the first photos. | Cuplikan foto pertama. |
| View-all action | View all photos | Lihat semua foto |
| View-all mobile | All photos | Semua foto |
| Full-browser title | All photos | Semua foto |
| Photo-kind tabs accessible name | Photo types | Jenis foto |
| Selection tab | Selection photos | Foto pilihan |
| Edited tab | Edited photos | Hasil edit |
| Print tab | Print photos | Foto cetak |
| Tab count | {photoType} ({count}) | {photoType} ({count}) |
| Folder breadcrumb root | All folders | Semua folder |
| Folder breadcrumb accessible name | Folder location | Lokasi folder |
| Folder totals | {folderCount} folders · {photoCount} photos | {folderCount} folder · {photoCount} foto |
| Photo-only total | {count} photos | {count} foto |
| File search label | Search filenames | Cari nama file |
| Search result summary | {count} photos match “{query}” | {count} foto cocok dengan “{query}” |
| Search empty title | No photos matching “{query}” | Tidak ada foto yang cocok dengan “{query}” |
| Search empty body | Try another part of the filename, or clear the search to return to folders. | Coba bagian lain dari nama file, atau hapus pencarian untuk kembali ke folder. |
| Folder empty title | No photos here yet | Belum ada foto di sini |
| Folder empty body | Photos of this type appear after the folder is synced. | Foto jenis ini muncul setelah folder disinkronkan. |
| Loading photos | Loading more photos… | Memuat foto berikutnya… |
| Browse failed | Photos couldn’t be loaded | Foto belum bisa dimuat |
| Gallery loading | Loading gallery… | Memuat galeri… |
| Preview missing title | File not found in Google Drive | File tidak ditemukan di Google Drive |
| Preview missing note | Hidden from clients until found again during sync. | Disembunyikan dari klien sampai ditemukan lagi saat sinkronisasi. |
| Draft visibility | Visible to clients after publishing. | Terlihat oleh klien setelah galeri dipublikasikan. |
| Published visibility | Visible to clients with the link and password. | Terlihat oleh klien yang punya link dan kata sandi. |
| Expired visibility | Hidden from clients while the gallery is expired. | Disembunyikan dari klien selama galeri kedaluwarsa. |
| Archived visibility | Hidden from clients. | Disembunyikan dari klien. |
| Canceled-draft visibility | Hidden from clients: the project was cancelled. | Tidak terlihat oleh klien: proyek dibatalkan. |
| Final-file visibility | Hidden until final delivery. Clients can’t select these photos. | Disembunyikan sampai hasil akhir dikirim. Foto ini tidak bisa dipilih klien. |
| Missing visibility | Missing photos are hidden until found again. | Foto yang hilang disembunyikan sampai ditemukan lagi. |
| Edited-tab explanation · Approved (Owner, 2026-10-12) | Hidden until final delivery is published. Files come from subfolders mapped to an edited-photo package item. | Disembunyikan sampai hasil akhir dipublikasikan. File berasal dari subfolder yang dipetakan ke item paket Hasil edit. |
| Print-tab explanation · Approved (Owner, 2026-10-12) | Hidden until final delivery is published. Files come from subfolders mapped to a printed-photo package item. | Disembunyikan sampai hasil akhir dipublikasikan. File berasal dari subfolder yang dipetakan ke item paket Foto cetak. |
| G1 "Pilihan klien" note, AC-GFL-001 | The client can choose once photos arrive. | Klien bisa memilih setelah foto masuk. |
| G1 *Hasil akhir* empty | No final files yet. | Belum ada file hasil akhir. |
| G2 *Hasil akhir* note, AC-GFL-019 | The client can download once files are synced. | Klien bisa mengunduh begitu file tersinkron. |
| G2 *Pilihan klien* status | Selections are final. | Pilihan sudah final. |

### 10.6 Publish, expiry and password changes

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| SUPERSEDED (F-27 iteration 5): Publish action| Publish gallery | Publikasikan galeri |
| SUPERSEDED (F-27 iteration 5): Publish confirmation| Publish this gallery? | Publikasikan galeri ini? |
| Publish body | Folders are checked again now. After that, clients can open the gallery using its link and password. | Folder dicek ulang sekarang. Setelah itu, klien bisa membuka galeri dengan tautan dan kata sandinya. |
| Publish expiry summary | Expiry: {expiryDescription}. | Kedaluwarsa: {expiryDescription}. |
| Publish refusal title | This gallery isn’t ready to publish | Galeri belum bisa dipublikasikan |
| Publish refusal body | No readable folders were found during the check. | Tidak ada folder yang bisa dibaca saat dicek ulang. |
| Publish refusal hint | Check that the folder is shared with “Anyone with the link”, then try again. | Pastikan folder dibagikan sebagai “Siapa saja yang memiliki link”, lalu coba lagi. |
| SUPERSEDED (F-27 iteration 5): Published toast| Gallery published | Galeri dipublikasikan |
| Published body | Share the gallery link and password with your client. | Bagikan tautan galeri dan kata sandi ke klien. |
| Expiry-dialog title | Gallery expiry | Kedaluwarsa galeri |
| Expiry body | After expiry, the client can’t open the gallery until you change it. | Setelah kedaluwarsa, klien tidak bisa membuka galeri sampai kamu mengubahnya. |
| Live duration helper | Counted from when you save. The gallery closes on {date}. | Dihitung dari saat disimpan. Galeri tertutup pada {date}. |
| Expiry saved | Expiry saved | Kedaluwarsa disimpan |
| SUPERSEDED (F-27 iteration 5): Reopened toast| Gallery reopened | Galeri dibuka lagi |
| Expired alert title | Gallery expired since {date} | Galeri kedaluwarsa sejak {date} |
| Expired alert body | The client can’t open the gallery. Set a new date or remove the expiry to open it again with the same link and password. | Klien tidak bisa membuka galeri. Atur tanggal baru atau hapus kedaluwarsa untuk membukanya lagi dengan link dan kata sandi yang sama. |
| Rotate-dialog title | Change gallery password | Ganti kata sandi galeri |
| Rotate body | The old password stops working immediately. Clients viewing the gallery must enter the new password. | Kata sandi lama langsung tidak berlaku. Klien yang sedang membuka galeri harus memasukkan kata sandi baru. |
| New password label | New password | Kata sandi baru |
| New password helper | Generated for you. You can change it to 6–64 characters. | Dibuat otomatis. Bisa diganti dengan 6–64 karakter. |
| Password changed title | Password changed | Kata sandi diganti |
| Password changed body | Share the new password with your client. The old password no longer works. | Bagikan kata sandi baru ke klien. Kata sandi lama tidak berlaku lagi. |
| D1 Select label | Duration | Durasi |
| Presets 7/14/30/60/90, AC-GFL-010, A-1 | {count, plural, one {# day} other {# days}} | {count, plural, other {# hari}} |

### 10.7 Unlink, archive and delete gallery

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Unlink action | Remove folder | Lepas folder |
| Unlink title | Remove {name}? | Lepas {name}? |
| Unlink body | {count} photos will be hidden from clients. The Drive folder stays unchanged. To use this folder again, add it as a new folder. | {count} foto disembunyikan dari klien. Folder di Drive tidak berubah. Untuk memakainya lagi, tambahkan sebagai folder baru. |
| SUPERSEDED (F-27 iteration 5): Last-folder constraint| A published gallery needs at least one active folder. | Galeri yang dipublikasikan butuh minimal satu folder aktif. |
| Unlinked toast | Folder unlinked | Folder dilepas |
| SUPERSEDED (F-27 iteration 5): Archive title| Archive this gallery? | Arsipkan galeri ini? |
| Archive body | Clients will no longer be able to open it. An archived gallery can’t be published again. | Klien tidak bisa membuka galeri lagi. Galeri yang diarsipkan tidak bisa dipublikasikan kembali. |
| SUPERSEDED (F-27 iteration 5): Archive CTA| Archive gallery | Arsipkan galeri |
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): Archived toast| Gallery archived | Galeri diarsipkan |
| SUPERSEDED (F-27 iteration 5): Archived read-only body| You can view this gallery, but can’t sync or edit it. Clients can’t open it. | Galeri ini bisa dilihat, tetapi tidak bisa disinkronkan atau diubah. Klien tidak bisa membukanya. |
| SUPERSEDED (F-27 iteration 5): Delete draft title| Delete this draft gallery? | Hapus galeri draf ini? |
| Delete draft body | The gallery, {folderCount} folders and {photoCount} photo records will be deleted from Shutrly. Google Drive files stay unchanged. | Galeri, {folderCount} folder, dan data {photoCount} foto dihapus dari Shutrly. File Google Drive tidak berubah. |
| SUPERSEDED (F-27 iteration 5): Delete CTA| Delete gallery | Hapus galeri |
| SUPERSEDED (F-27 iteration 5): Deleted toast| Draft gallery deleted | Galeri draf dihapus |
| Canceled-project draft restriction | This draft can’t be published, synced or edited. You can still delete it. | Draf ini tidak bisa dipublikasikan, disinkronkan, atau diubah. Kamu masih bisa menghapusnya. |
| D3 body, design wording | This is the gallery’s last folder. {count} photos from it are removed from the gallery, and Send link to client stays hidden until you add a folder. The folder in Google Drive doesn’t change. | Ini folder terakhir galeri. {count} foto dari folder ini dihapus dari galeri, dan Kirim link ke klien tidak muncul sampai kamu menambah folder lagi. Folder di Google Drive tidak berubah. |

### 10.8 Gallery field validation and domain refusals

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Password too short | Use at least 6 characters. | Gunakan minimal 6 karakter. |
| Password too long | Use no more than 64 characters. | Gunakan maksimal 64 karakter. |
| Required field | Fill in this field. | Isi kolom ini. |
| Invalid field | Check this field and try again. | Cek isian ini, lalu coba lagi. |
| Non-whole duration | Enter a whole number of days. | Isi jumlah hari dengan angka bulat. |
| Duration out of range | Enter between 1 and 3,650 days. | Isi antara 1 dan 3.650 hari. |
| Past expiry | Choose today or a later date. | Pilih hari ini atau tanggal setelahnya. |
| Not a Drive link | Paste a Google Drive folder link. | Tempel tautan folder Google Drive. |
| File instead of folder | This is a file link. Paste a Google Drive folder link. | Ini tautan file. Tempel tautan folder Google Drive. |
| Folder already linked | This folder is already in this gallery. | Folder ini sudah ada di galeri ini. |
| Source inactive | This source is no longer active. Choose another source. | Sumber ini sudah tidak aktif. Pilih sumber lain. |
| Label too long | Use no more than 60 characters for the label. | Label maksimal 60 karakter. |
| Link too long | This link is too long. | Tautan ini terlalu panjang. |
| Project not allowed | Confirm the project’s booking before creating a gallery. | Konfirmasi pemesanan proyek sebelum membuat galeri. |
| Gallery already exists | This project already has a gallery. | Proyek ini sudah punya galeri. |
| Invalid state | The gallery has changed. Reload the page. | Galeri sudah berubah. Muat ulang halaman. |
| Sync already running | This folder is already syncing. | Folder ini sedang disinkronkan. |
| Sync rate limited | Too many sync requests. Try again in a moment. | Terlalu banyak permintaan sinkronisasi. Coba lagi sebentar lagi. |
| Save failure title | Changes couldn’t be saved | Perubahan belum tersimpan |
| Save failure body | Check your connection, then try again. | Cek koneksi, lalu coba lagi. |

### 10.9 Share gallery link — share dialog and entry points (F-27 iteration 6)

Source: `gallery-share-dialog.copy.ts` (`galleryShare`), Owner-approved in `copy-draft.md` iteration 6. Owner decisions of 2026-10-18: `{name}` in the `GALLERY_SHARE` message is the client’s first name, and a failed copy shows the *copyFailed* toast. The project menu rows are in §10.9 too; the gallery card and page button reuse the §10.1 *Kirim link ke klien* row.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Dialog title (K1, K2) | Send link to client | Kirim link ke klien |
| Dialog description | Check the message, then send it from WhatsApp. Shutrly doesn’t send anything itself. | Periksa pesannya, lalu kirim dari WhatsApp. Shutrly tidak mengirim apa pun sendiri. |
| Recipient label | To | Kepada |
| Recipient value | {name} · {phone} | {name} · {phone} |
| Recipient without number | {name} · no WhatsApp number | {name} · belum ada nomor WhatsApp |
| Password note (K1) | The gallery password is in this message. Anyone who gets it can open the gallery. | Kata sandi galeri ikut di pesan ini. Siapa pun yang menerima pesan ini bisa membuka galeri. |
| Edit template link | Edit template | Ubah template |
| Copy message button | Copy message | Salin pesan |
| Copied toast title and body | Message copied / Paste it into WhatsApp. | Pesan disalin / Tempel di WhatsApp. |
| Copy failed toast (Owner 2026-10-18) | Couldn’t copy the message. Copy it from the message box. | Pesan tidak bisa disalin. Salin manual dari kotak pesan. |
| Open WhatsApp button | Open WhatsApp | Buka WhatsApp |
| No-number alert title (K2) | {name} doesn’t have a WhatsApp number yet | {name} belum punya nomor WhatsApp |
| No-number alert body (K2) | Add a number in the client’s details to open WhatsApp. You can still copy the message. | Tambahkan nomor di data klien untuk membuka WhatsApp. Kamu tetap bisa menyalin pesannya. |
| Add number action (K2) | Add WhatsApp number | Tambah nomor WhatsApp |
| Loading state | Preparing the message… | Menyiapkan pesan… |
| Error state title | The gallery link can’t be sent yet | Link galeri belum bisa dikirim |
| Error state body | Try again in a moment. The gallery can’t be shared right now. | Coba lagi sebentar lagi. Galeri belum bisa dibagikan saat ini. |
| Close (error state) | Close | Tutup |
| Project ⋯ menu: share item (AC-GFL-013, 014, 020) | Send link to client | Kirim link ke klien |
| Project ⋯ menu: Tandai terkirim item (A-6) | Mark as delivered | Tandai terkirim |
| Project ⋯ menu: Tandai terkirim hint, no finished file (AC-GFL-017) | No final files are synced yet. Sync the final-files folder first. | Belum ada hasil akhir yang tersinkron. Sinkronkan folder hasil akhir dulu. |

## 11. Message templates and WhatsApp defaults

**Pages:** `{workspace}/message-templates` and `{workspace}/message-templates/{templateType}`. Sources: communications UI copy and `default-templates.ts`. There are five logical templates; paired languages do not create ten template types. Real sharing remains a future feature and always requires the Owner’s action.

### 11.1 Template list

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Page title | Message templates | Templat pesan |
| Sending note | You send each message yourself through WhatsApp. | Kamu tetap mengirim setiap pesan sendiri lewat WhatsApp. |
| Gallery group | Galleries | Galeri |
| Gallery group description | For galleries and final photos. | Untuk galeri dan hasil akhir. |
| Invoice group | Invoices | Tagihan |
| Invoice group description | For client invoices. | Untuk tagihan klien. |
| Gallery-share label | Share gallery | Bagikan galeri |
| Gallery-share purpose | For when the gallery is ready for client selections. | Untuk galeri yang siap dipilih klien. |
| Selection-reminder label | Selection reminder | Pengingat pilihan foto |
| Selection-reminder purpose | Remind clients to finish choosing their photos. | Ingatkan klien untuk menyelesaikan pilihan fotonya. |
| Final-delivery label | Final delivery | Hasil akhir |
| Final-delivery purpose | For when final photos are ready to download. | Untuk hasil akhir yang siap diunduh. |
| Invoice-share label | Share invoice | Bagikan tagihan |
| Invoice-share purpose | For when an invoice has been issued. | Untuk tagihan yang sudah diterbitkan. |
| Payment-reminder label | Payment reminder | Pengingat pembayaran |
| Payment-reminder purpose | For invoices with an outstanding balance. | Untuk tagihan yang belum lunas. |
| List loading | Loading message templates… | Memuat templat pesan… |

### 11.2 Template editor, preview and unsaved changes

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Content heading/label | Message content | Isi pesan |
| Content description | Placeholders are replaced with project details when you prepare a message. | Penanda diganti dengan data proyek saat kamu menyiapkan pesan. |
| Mobile heading | Message | Pesan |
| Variable-syntax helper | Copy variables exactly as shown below, including the double braces. | Tulis variabel persis seperti di bawah, termasuk kurung kurawal gandanya. |
| Mobile syntax helper | Copy variables exactly as shown below. | Tulis variabel persis seperti di bawah. |
| Character count | {length} / {max} | {length} / {max} |
| Variable section | Insert project details | Sisipkan data proyek |
| Desktop insert helper | Click to insert at the cursor. Required variables must be included. | Klik untuk menyisipkan di posisi kursor. Variabel wajib harus ada di pesan. |
| Mobile insert helper | Tap to insert at the cursor. | Ketuk untuk menyisipkan di posisi kursor. |
| Required-variable marker | Required | Wajib |
| Variable accessible name | Insert {{variableName}} | Sisipkan {{variableName}} |
| Required-variable accessible name | Insert {{variableName}}, required | Sisipkan {{variableName}}, wajib |
| View tabs accessible name | Message view | Tampilan pesan |
| Edit tab | Edit | Ubah |
| Preview tab/title | Preview | Pratinjau |
| Preview description | Check how the message reads using sample project details. | Cek tampilan pesan dengan data proyek contoh. |
| Preview region accessible name | Message preview | Pratinjau pesan |
| Preview password note | The gallery password is filled in when you prepare the sharing message. | Kata sandi galeri terisi saat kamu menyiapkan pesan untuk dibagikan. |
| Preview error | Fix the template to see the preview again. | Perbaiki isi templat agar pratinjau muncul lagi. |
| Restore-default action | Restore default wording | Kembalikan teks bawaan |
| Save action | Save | Simpan |
| Saving action | Saving… | Menyimpan… |
| Saved title | Template saved | Templat disimpan |
| Saved body | {templateName} will use the updated wording. | {templateName} akan memakai isi terbaru. |
| Server-error title | Template couldn’t be saved | Templat belum tersimpan |
| Server-error body | Your message is still here. Try saving again. | Isi pesanmu masih ada. Coba simpan lagi. |
| Unsaved dialog title | Discard your changes? | Buang perubahanmu? |
| Unsaved description | Changes to {templateName} haven’t been saved. Leaving will discard them. | Perubahan pada {templateName} belum disimpan. Kalau keluar, perubahannya akan hilang. |
| Unsaved mobile description | Changes to {templateName} haven’t been saved. | Perubahan pada {templateName} belum disimpan. |
| Keep editing | Keep editing | Lanjut mengedit |
| Discard action | Discard changes | Buang perubahan |

Restore-default copy does not decide whether the control resets one language or both. That behavior must be settled before exposing a bilingual reset control. It changes editor text only until Save, as in the existing template feature.

Preview sample identities stay `Rina & Dimas`, project name and workspace brand unchanged, invoice number `AW-0012`, password `••••••`, and sample token links unchanged. Format sample IDR amounts for the active presentation locale only after safe formatting policy is agreed. Preview timestamps must follow the same locale/time policy as their containing UI.

### 11.3 Template validation

| Condition | English | Bahasa Indonesia |
|---|---|---|
| Empty content | Enter a message. | Isi pesan. |
| Content too long | Use no more than {max} characters. | Gunakan maksimal {max} karakter. |
| Malformed variable | Write variables as {{variableName}}, without spaces, for example {{clientName}}. | Tulis variabel sebagai {{variableName}} tanpa spasi, misalnya {{clientName}}. |
| Unknown variable | {{variableName}} isn’t supported in {templateName}. Use a variable from the list below. | {{variableName}} tidak bisa dipakai di {templateName}. Pilih variabel dari daftar di bawah. |
| Missing required variable | Include {{variableName}} so the client can open the {target}. | Sertakan {{variableName}} agar klien bisa membuka {target}. |
| Gallery target | gallery | galeri |
| Invoice target | invoice | tagihan |
| Generic validation | This message couldn’t be saved. Check its content. | Pesan ini belum bisa disimpan. Cek isinya. |

The visible `{{variableName}}` above represents the actual stable variable key being explained. Technical variable keys are identifiers, not UI prose to translate.

### 11.4 Default WhatsApp messages — recipient-facing content

**Where:** shown as sample content in the editor; later rendered into a manually shared WhatsApp message by F-15. These are proposed new default versions, not replacements for existing custom messages. Recipient language must be selected explicitly under the final recipient policy. Newline layout is intentional.

#### Gallery share — `GALLERY_SHARE`

**English**

```text
Hi {{clientName}},

Your gallery for {{projectTitle}} from {{brandName}} is ready:
{{galleryUrl}}

Password: {{galleryPassword}}

Choose your favorite photos. Thank you!
```

**Bahasa Indonesia**

```text
Halo {{clientName}},

Galeri {{projectTitle}} dari {{brandName}} sudah bisa dibuka:
{{galleryUrl}}

Kata sandi: {{galleryPassword}}

Pilih foto favoritmu, ya. Terima kasih!
```

#### Selection reminder — `SELECTION_REMINDER`

**English**

```text
Hi {{clientName}},

A reminder from {{brandName}}: your photo selections for {{projectTitle}} aren’t complete yet.
Continue choosing here:
{{galleryUrl}}

Thank you!
```

**Bahasa Indonesia**

```text
Halo {{clientName}},

Pengingat dari {{brandName}}: pilihan foto untuk {{projectTitle}} belum selesai.
Lanjutkan memilih di sini:
{{galleryUrl}}

Terima kasih!
```

#### Final delivery — `FINAL_DELIVERY`

**English**

```text
Hi {{clientName}},

Your final photos for {{projectTitle}} from {{brandName}} are ready to download:
{{galleryUrl}}

Password: {{galleryPassword}}

Thank you for choosing us to capture your moments!
```

**Bahasa Indonesia**

```text
Halo {{clientName}},

Hasil akhir {{projectTitle}} dari {{brandName}} sudah siap diunduh:
{{galleryUrl}}

Kata sandi: {{galleryPassword}}

Terima kasih sudah memercayakan momenmu kepada kami!
```

#### Invoice share — `INVOICE_SHARE`

**English**

```text
Hi {{clientName}},

Invoice {{invoiceNumber}} for {{projectTitle}} from {{brandName}} has been issued.
Total: {{invoiceTotal}}

View the invoice and payment details:
{{invoiceUrl}}

Thank you!
```

**Bahasa Indonesia**

```text
Halo {{clientName}},

Tagihan {{invoiceNumber}} untuk {{projectTitle}} dari {{brandName}} sudah terbit.
Total: {{invoiceTotal}}

Lihat tagihan dan informasi pembayaran:
{{invoiceUrl}}

Terima kasih!
```

#### Payment reminder — `PAYMENT_REMINDER`

**English**

```text
Hi {{clientName}},

A reminder from {{brandName}}: invoice {{invoiceNumber}} for {{projectTitle}} has an outstanding balance of {{invoiceBalance}}.

View the invoice and payment details:
{{invoiceUrl}}

Thank you!
```

**Bahasa Indonesia**

```text
Halo {{clientName}},

Pengingat dari {{brandName}}: tagihan {{invoiceNumber}} untuk {{projectTitle}} belum lunas.
Sisa tagihan: {{invoiceBalance}}

Lihat tagihan dan informasi pembayaran:
{{invoiceUrl}}

Terima kasih!
```

These drafts avoid a “pay here” claim that could imply a payment gateway. The existing MVP records payments manually. Do not add due-date urgency, late fees or deadlines unless verified feature data supplies them.

## 12. Auth emails

**Where:** recipient inbox, not a dashboard route. Source: `src/adapters/email/auth-email-templates/auth-email-templates.copy.ts`. Actual links remain escaped/generated by the adapter. The recipient locale policy is pending; do not choose it from the last dashboard locale without that policy.

### 12.1 Verification email

| Element | English | Bahasa Indonesia |
|---|---|---|
| Subject | Verify your Shutrly email | Verifikasi email Shutrly kamu |
| Greeting | Hi {name}, | Halo {name}, |
| Intro | Confirm your email to finish signing up for Shutrly. | Konfirmasi emailmu untuk menyelesaikan pendaftaran Shutrly. |
| Action | Verify email | Verifikasi email |
| Expiry | This link is valid for 24 hours and can only be used once. | Tautan ini berlaku 24 jam dan hanya bisa dipakai sekali. |
| Ignore note | If you didn’t create a Shutrly account, ignore this email. | Kalau kamu tidak membuat akun Shutrly, abaikan email ini. |

### 12.2 Password-reset email

| Element | English | Bahasa Indonesia |
|---|---|---|
| Subject | Reset your Shutrly password | Atur ulang kata sandi Shutrly kamu |
| Greeting | Hi {name}, | Halo {name}, |
| Intro | Set a new password for your Shutrly account. | Buat kata sandi baru untuk akun Shutrly kamu. |
| Action | Set new password | Buat kata sandi baru |
| Expiry | This link is valid for one hour and can only be used once. | Tautan ini berlaku satu jam dan hanya bisa dipakai sekali. |
| Ignore note | If you didn’t request this, ignore this email. Your password hasn’t changed. | Kalau kamu tidak memintanya, abaikan email ini. Kata sandimu tidak berubah. |

## 13. Owner-authored text and language hints

**Where:** the custom message template editor and the owner’s add-on form. Owner-authored text is one text, kept and shown as written. Services and categories have no description field. There are no paired authoring fields, readiness states, translation drafts or automatic translation.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Template-language hint | This message is sent in the language you write it in. Shutrly doesn’t translate it. | Pesan ini dikirim dalam bahasa yang kamu tulis. Shutrly tidak menerjemahkannya. |
| Custom message field label and helper | Reuse §11.2: Content heading/label and Content description. | Gunakan kembali §11.2: Content heading/label dan Content description. |
| Add-on description field label and helper | Reuse §16: Form “Description” and Helpers “Shown in the add-on list, not to the client.” | Gunakan kembali §16: Form “Description” dan Helpers “Tampil di daftar add-on, tidak untuk klien.” |
| Restore-default helper | When you save, the default text returns in your language. | Saat disimpan, teks bawaan kembali dalam bahasa kamu. |

Recipient language is chosen per message and preselected to the owner’s language. No new string is needed here: the owner message-preview screen is not part of the existing product surface covered by this deck; add its choice helper with the approved F-15 message-preview copy when that screen is designed.

### Open questions

None for this scope.

## 14. Client gallery — built surfaces

Submission copy in 14.2 applies to the current selection group. A gallery-wide submit action is not approved by this deck; lifecycle is per group (BR-SEL-005).

**Where:** implemented client token-link journey (`/g/{token}`, `/photos`, `/final`, `/picks/{groupId}` and `/picks/{groupId}/review`). The tables below update the earlier drafts with the built states. Selection submission remains per group; do not add a gallery-wide submit action or automatic progress-saving claim.

### 14.1 Password entry and unavailable access

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Password-entry title | Open your gallery | Buka galerimu |
| Password-entry lead | Enter the password shared by your photographer. | Masukkan kata sandi yang dibagikan fotografermu. |
| Password label | Gallery password | Kata sandi galeri |
| Main CTA | Open gallery | Buka galeri |
| Pending CTA | Opening gallery… | Membuka galeri… |
| Incorrect password | The password is incorrect. Check it and try again. | Kata sandinya salah. Cek lalu coba lagi. |
| Rate-limited state | Too many attempts. Try again later. | Terlalu banyak percobaan. Coba lagi nanti. |
| Generic unavailable title | This gallery isn’t available | Galeri ini tidak tersedia |
| Generic unavailable help | Contact your photographer for help. | Hubungi fotografermu untuk bantuan. |
| Rotated-password re-entry | The gallery password has changed. Enter the new password from your photographer. | Kata sandi galeri sudah diganti. Masukkan kata sandi baru dari fotografermu. |

Use generic unavailable copy where security rules prohibit revealing whether a token exists, is archived or expired. Distinct expiry/archival details must be authorized by the client-access design.

### 14.2 Client selections — built selection feature

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Selection heading | Choose your photos | Pilih fotomu |
| Selection instruction | Choose your favorite photos within each group’s allowance. | Pilih foto favoritmu sesuai jatah di setiap kelompok. |
| Editing group | Photos to edit | Foto untuk diedit |
| Printing group | Photos to print | Foto untuk dicetak |
| Photo-count allowance | {selected} of {limit} photos selected | {selected} dari {limit} foto dipilih |
| Print-count allowance | {selected} of {limit} prints selected | {selected} dari {limit} lembar dipilih |
| Selected accessible state | {filename}, selected | {filename}, dipilih |
| Unselected accessible state | {filename}, not selected | {filename}, belum dipilih |
| Print quantity label | Number of prints | Jumlah cetak |
| Over-allowance message | This group’s allowance has been exceeded. Review your selections. | Pilihan melebihi jatah kelompok ini. Cek pilihanmu lagi. |
| Submit CTA | Submit selections | Kirim pilihan |
| Submit confirmation title | Submit your photo selections? | Kirim pilihan fotomu? |
| Submit confirmation consequence | Once submitted, your selections can’t be changed. | Setelah dikirim, pilihanmu tidak bisa diubah. |
| Keep reviewing | Review selections | Cek pilihan lagi |
| Submitting CTA | Submitting… | Mengirim… |
| Submitted title | Selections submitted | Pilihan dikirim |
| Submitted body | Your photographer can now review your selections. | Fotografermu sudah bisa melihat pilihanmu. |
| Concurrent-change error | Your selections need another review. Reload the latest details before submitting. | Pilihanmu perlu dicek lagi. Muat data terbaru sebelum mengirim. |

The selected/limit/remaining wording follows BR-SEL-* and the implemented partial-send behavior. Do not imply that every allowance must be filled or that submitted groups remain editable indefinitely.

### 14.3 Final delivery — built delivery feature

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Delivery heading | Your final photos | Hasil akhir fotomu |
| Delivery lead | Your photos are ready to download. | Fotomu sudah siap diunduh. |
| Edited group | Edited photos | Hasil edit |
| Print group | Print files | File cetak |
| Download action | Download | Unduh |
| Download-photo accessible name | Download {filename} | Unduh {filename} |
| Load failure | Photos couldn’t be loaded. Try again. | Foto belum bisa dimuat. Coba lagi. |

Do not add bulk-download, download-progress, file-retention or permanent-access promises until delivery behavior is designed.

### 14.4 Proposed rows (I7.1, pending Owner review)

These rows come from client gallery strings that have no deck row yet. The English is a faithful rendering of the current Indonesian and is marked `PROPOSED (pending Owner review)` in the copy file. The Owner accepts, edits or replaces each row here before it becomes deck copy.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Client gallery client-browse-screen: subtitle | Browse your photos. Open a photo to pick it for a package part. | Lihat-lihat foto Anda. Buka foto untuk memilihnya ke bagian paket. |
| Client gallery client-browse-screen: subtitleNoGroups | See all your photos. | Lihat semua foto Anda. |
| Client gallery client-browse-screen: cardTitle | Photos | Foto |
| Client gallery client-browse-screen: cardMeta | {photos, plural, one {# photo} other {# photos}} | {photos, plural, other {# foto}} |
| Client gallery client-browse-screen: cardMetaFolders | {photos, plural, one {# photo} other {# photos}} · {folders, plural, one {# folder} other {# folders}} | {photos, plural, other {# foto}} · {folders, plural, other {# folder}} |
| Client gallery client-browse-screen: folderMeta | {name} · {photos, plural, one {# photo} other {# photos}} | {name} · {photos, plural, other {# foto}} |
| Client gallery client-browse-screen: searchMeta | {count, plural, one {# result} other {# results}} | {count, plural, other {# hasil}} |
| Client gallery client-browse-screen: searchPlaceholder | Search file names | Cari nama file |
| Client gallery client-browse-screen: searchLabel | Search file names | Cari nama file |
| Client gallery client-browse-screen: rootLabel | All folders | Semua folder |
| Client gallery client-browse-screen: rootSummary | All folders · {folders, plural, one {# folder} other {# folders}}, {photos, plural, one {# photo} other {# photos}} | Semua folder · {folders, plural, other {# folder}}, {photos, plural, other {# foto}} |
| Client gallery client-browse-screen: searchSummary | {count, plural, one {# photo matches} other {# photos match}} “{text}” | {count, plural, other {# foto cocok}} dengan “{text}” |
| Client gallery client-browse-screen: folderCount | {count, plural, one {# photo} other {# photos}} | {count, plural, other {# foto}} |
| Client gallery client-browse-screen: folderFallbackName | Folder | Folder |
| Client gallery client-browse-screen: failedTitle | Photos couldn’t be loaded | Foto gagal dimuat |
| Client gallery client-browse-screen: failedBody | Check your connection, then try again. | Periksa koneksi Anda, lalu coba lagi. |
| Client gallery client-browse-screen: unavailableTitle | Photos can’t be shown yet | Foto belum bisa ditampilkan |
| Client gallery client-browse-screen: unavailableBody | We couldn’t get the photos right now. | Kami tidak bisa mengambil foto saat ini. |
| Client gallery client-browse-screen: emptyTitle | No photos yet | Belum ada foto |
| Client gallery client-browse-screen: emptyBody (changed in F-27 iteration 7, was “Your photographer hasn’t added photos here yet.”) | The photographer hasn’t added photos to this gallery yet. Try again later. | Fotografer belum menambahkan foto ke galeri ini. Coba lagi nanti. |
| Client gallery client-browse-screen: searchEmptyTitle | No photos “{text}” | Tidak ada foto “{text}” |
| Client gallery client-browse-screen: searchEmptyBody | Try another file name. | Coba nama file lain. |
| Client gallery client-browse-screen: loadingMore | Loading more photos… | Memuat foto lainnya… |
| Client gallery client-browse-screen: viewerMissing | This photo isn’t available anymore | Foto ini tidak tersedia lagi |
| Client gallery client-browse-screen: downloadAll | Download all | Unduh semua |
| Client gallery client-browse-screen: downloadMenu | Download options | Pilihan unduhan |
| Client gallery client-browse-screen: pickSeveral | Pick several | Pilih beberapa |
| Client gallery client-browse-screen: selectedTitle | {count, plural, one {# photo selected} other {# photos selected}} | {count, plural, other {# foto dipilih}} |
| Client gallery client-browse-screen: downloadSelected | Download {count, plural, one {# photo} other {# photos}} | Unduh {count, plural, other {# foto}} |
| Client gallery client-browse-screen: pickFor | Put in… | Masukkan ke… |
| Client gallery client-browse-screen: pickPhotos | Pick photos | Pilih foto |
| Client gallery client-browse-screen: pickedTitle | {count, plural, =0 {All photos are already in {group}} other {# photos picked for {group}}} | {count, plural, =0 {Semua foto sudah ada di {group}} other {# foto dipilih untuk {group}}} |
| Client gallery client-browse-screen: pickLimitTitle | Picks exceed the limit | Pilihan melebihi batas |
| Client gallery client-browse-screen: pickLimitBody | {remaining, plural, one {# photo is} other {# photos are}} left in this part. Remove some picked photos, then try again. | Sisa {remaining, plural, other {# foto}} di bagian ini. Kurangi foto yang dipilih, lalu coba lagi. |
| Client gallery client-browse-screen: pickClosed | This part’s picks are already sent | Pilihan bagian ini sudah dikirim |
| Client gallery client-browse-screen: pickRefused | Photos couldn’t be picked. Try again. | Foto belum bisa dipilih. Coba lagi. |
| Client gallery client-browse-screen: progressTitle | Downloading photos | Mengunduh foto |
| Client gallery client-browse-screen: confirmTitle | Download all {count, plural, one {# photo} other {# photos}}? | Unduh semua {count, plural, other {# foto}}? |
| Client gallery client-browse-screen: downloadPhoto | Download photo | Unduh foto |
| Client gallery client-copy: home | Home | Beranda |
| Client gallery client-copy: finalDelivery | Final photos | Hasil akhir |
| Client gallery client-copy: groupStatusOpen | Open | Terbuka |
| Client gallery client-copy: defaultUnit | photos | foto |
| Client gallery client-copy: usageReview | {usage} of {limit} {unit} · {remaining} left | {usage} dari {limit} {unit} · sisa {remaining} |
| Client gallery client-copy: usageSubmitted | {usage} {unit} submitted · waiting for your photographer | {usage} {unit} dikirim · menunggu fotografer |
| Client gallery client-copy: usageLocked | {usage} {unit} · locked by your photographer | {usage} {unit} · dikunci fotografer |
| Client gallery client-gate-screen: description | {projectTitle} gallery from {studioName}. Your photographer sent the password with this link. | Galeri {projectTitle} dari {studioName}. Kata sandi dikirim fotografer bersama link ini. |
| Client gallery client-home-screen: greeting | Hello, {name} | Halo, {name} |
| Client gallery client-home-screen: subtitleStart | Choose photos for your package, then send them to your photographer. | Pilih foto untuk paket Anda, lalu kirim ke fotografer. |
| Client gallery client-home-screen: subtitlePartly | {sent} sent. Left to choose: {open}. | {sent} sudah dikirim. Tinggal {open}. |
| Client gallery client-home-screen: subtitleAllSent | All selections are sent. Your photographer will let you know. | Semua pilihan sudah dikirim. Fotografer akan mengabari Anda. |
| Client gallery client-home-screen: subtitleDelivered | Your photos have been edited. | Foto Anda sudah selesai diedit. |
| Client gallery client-home-screen: subtitleNoGroups | See all your photos. | Lihat semua foto Anda. |
| Client gallery client-home-screen: subtitleNoPhotos (new, F-27 iteration 7; Owner-approved, C1 empty *Beranda*) | No photos yet · the photographer hasn’t added any. Try again later. | Belum ada foto · fotografer belum menambahkan foto. Coba lagi nanti. |
| Client gallery client-home-screen: listJoin |  and  |  dan  |
| Client gallery client-home-screen: finalReadyTitle | Final photos are ready | Hasil akhir siap |
| Client gallery client-home-screen: finalReadyBody | {edited, plural, one {# edited photo} other {# edited photos}} and {print, plural, one {# print photo} other {# print photos}}. Download one at a time, several, or all. | {edited, plural, other {# foto edit}} dan {print, plural, other {# foto cetak}}. Unduh satu per satu, beberapa, atau semuanya. |
| Client gallery client-home-screen: finalReadyAction | View & download | Lihat & unduh |
| Client gallery client-home-screen: finalReadyNoDate (new, F-27 iteration 7; EN uses ICU plural, ID keeps the same wording with a plural wrapper; no delivery date) | {edited, plural, one {# edited photo} other {# edited photos}} · {print, plural, one {# print photo} other {# print photos}} | {edited, plural, other {# Foto edit}} · {print, plural, other {# Foto cetak}} |
| Client gallery client-home-screen: photosTitle | Your photos | Foto Anda |
| Client gallery client-home-screen: photosDescription | View all photos, then download the final files when they’re ready. | Lihat semua foto, lalu unduh hasil akhir saat sudah siap. |
| Client gallery client-home-screen: photosDescriptionDelivered | View all preview photos from your session. | Lihat semua foto pratinjau dari sesi Anda. |
| Client gallery client-home-screen: allPhotosMeta | {count, plural, one {# photo} other {# photos}} · browse and pick from previews | {count, plural, other {# foto}} · lihat-lihat dan pilih dari pratinjau |
| Client gallery client-home-screen: allPhotosMetaNoGroups | {count, plural, one {# photo} other {# photos}} · browse previews | {count, plural, other {# foto}} · lihat-lihat pratinjau |
| Client gallery client-home-screen: finalUnavailable (replaces finalPendingMeta, F-27 iteration 7; *Hasil akhir* row when no finished file is visible yet) | Not available yet · it appears here once the photos are edited. | Belum tersedia · muncul di sini setelah foto selesai diedit. |
| Client gallery client-home-screen: pickTitle | Choose photos | Pilih foto |
| Client gallery client-home-screen: pickDescription | One row for each part of your package. Choose and send each part on its own. | Satu baris untuk tiap bagian paket Anda. Pilih dan kirim tiap bagian sendiri. |
| Client gallery client-home-screen: actionStart | Start choosing | Mulai memilih |
| Client gallery client-home-screen: actionContinue | Continue choosing | Lanjut memilih |
| Client gallery client-home-screen: actionView | View choices | Lihat pilihan |
| Client gallery client-password-form: placeholder | Type the password from your photographer | Ketik kata sandi dari fotografer |
| Client gallery client-password-form: helper | Lowercase letters and numbers, for example mawar-4821. | Huruf kecil dan angka, contoh mawar-4821. |
| Client gallery client-password-form: empty | Enter the password from your photographer. | Isi kata sandi dari fotografer. |
| Client gallery client-password-form: lockedBody | Try again in {minutes, plural, one {# minute} other {# minutes}}. | Coba lagi dalam {minutes, plural, other {# menit}}. |
| Client gallery client-password-form: lockedHelper | The password isn’t checked until the time limit ends. | Kata sandi tidak diperiksa sampai batas waktu habis. |
| Client gallery client-password-form: showPassword | Show password | Tampilkan kata sandi |
| Client gallery client-password-form: hidePassword | Hide password | Sembunyikan kata sandi |
| Client gallery client-password-form: failed | The password couldn’t be checked. Try again. | Gagal memeriksa kata sandi. Coba lagi. |
| Client gallery pick-note-sheet: title | Note for {fileName} | Catatan untuk {fileName} |
| Client gallery pick-note-sheet: description | Optional. Write what you’d like your photographer to change in this photo. | Opsional. Tulis apa yang ingin diubah fotografer dari foto ini. |
| Client gallery pick-note-sheet: pickedFor | Picked for {groupName} | Dipilih untuk {groupName} |
| Client gallery pick-note-sheet: label | Note | Catatan |
| Client gallery pick-note-sheet: helper | Optional · {count}/{max} | Opsional · {count}/{max} |
| Client gallery pick-note-sheet: save | Save note | Simpan catatan |
| Client gallery pick-note-sheet: tooLong | Notes can be up to {max} characters. | Catatan paling banyak {max} karakter. |
| Client gallery pick-note-sheet: failed | The note wasn’t saved. Try again. | Catatan belum tersimpan. Coba lagi. |
| Client gallery pick-note-sheet: rateLimited | Too many changes. Try again in a moment. | Terlalu banyak perubahan, coba lagi sebentar. |
| Client gallery pick-screen: subtitle | Choose up to {limit} {unit}. | Pilih hingga {limit} {unit}. |
| Client gallery pick-screen: subtitleQuantity | Choose up to {limit} {unit}. Set the quantities in Review. | Pilih hingga {limit} {unit}. Atur jumlahnya di Tinjau. |
| Client gallery pick-screen: review | Review | Tinjau |
| Client gallery pick-screen: cardTitle | Photos | Foto |
| Client gallery pick-screen: cardMeta | {total, plural, one {# photo} other {# photos}} · tap a photo to pick it | {total, plural, other {# foto}} · ketuk foto untuk memilih |
| Client gallery pick-screen: filterLabel | Show photos | Tampilkan foto |
| Client gallery pick-screen: filterPicked | Picked | Dipilih |
| Client gallery pick-screen: limitTitle | Pick limit reached | Batas pilihan tercapai |
| Client gallery pick-screen: limitBody | {name} already has {usage} of {limit}. Remove one photo to pick another. | {name} sudah {usage} dari {limit}. Lepas satu foto untuk memilih yang lain. |
| Client gallery pick-screen: quantity | × {quantity} | × {quantity} |
| Client gallery pick-screen: otherGroupQuantity | {name} × {quantity} | {name} × {quantity} |
| Client gallery pick-screen: note | Note | Catatan |
| Client gallery pick-screen: noteAdd | Add a note for {fileName} | Tambah catatan untuk {fileName} |
| Client gallery pick-screen: noteEdit | Edit the note for {fileName} | Ubah catatan untuk {fileName} |
| Client gallery pick-screen: pickedEmptyTitle | No photos picked yet | Belum ada foto dipilih |
| Client gallery pick-screen: pickedEmptyBody | Tap photos under All photos to pick them. | Ketuk foto di Semua foto untuk memilih. |
| Client gallery pick-screen: rateLimited | Too many changes. Try again in a moment. | Terlalu banyak perubahan, coba lagi sebentar. |
| Client gallery pick-screen: refused | This photo can’t be picked. | Foto ini tidak bisa dipilih. |
| Client gallery pick-screen: failed | The pick wasn’t saved. Try again. | Pilihan belum tersimpan. Coba lagi. |
| Client gallery review-screen: title | Review {name} | Tinjau {name} |
| Client gallery review-screen: subtitle | Check your picks. Once sent, they can’t be changed. | Periksa pilihan Anda. Setelah dikirim, pilihan tidak bisa diubah. |
| Client gallery review-screen: subtitleSubmitted | Your picks are sent and waiting for your photographer. They can’t be changed. | Pilihan sudah dikirim dan menunggu fotografer. Pilihan tidak bisa diubah. |
| Client gallery review-screen: subtitleLocked | Your photographer has locked these picks. They can’t be changed. | Pilihan sudah dikunci fotografer. Pilihan tidak bisa diubah. |
| Client gallery review-screen: breadcrumbCurrent | Review | Tinjau |
| Client gallery review-screen: backToPick | Back to picking | Kembali memilih |
| Client gallery review-screen: cardTitle | Your picks | Pilihan Anda |
| Client gallery review-screen: cardMetaCount | {picks, plural, one {# photo} other {# photos}} | {picks, plural, other {# foto}} |
| Client gallery review-screen: cardMetaQuantity | {picks, plural, one {# photo} other {# photos}} · {usage} {unit}. Set the print count for each photo. | {picks, plural, other {# foto}} · {usage} {unit}. Atur jumlah cetak tiap foto. |
| Client gallery review-screen: cardMetaQuantityReadOnly | {picks, plural, one {# photo} other {# photos}} · {usage} {unit} | {picks, plural, other {# foto}} · {usage} {unit} |
| Client gallery review-screen: addMore | Add more photos | Tambah foto lagi |
| Client gallery review-screen: send | Send {usage} {unit} | Kirim {usage} {unit} |
| Client gallery review-screen: sendEmpty | Send | Kirim |
| Client gallery review-screen: emptyTitle | No photos picked yet | Belum ada foto dipilih |
| Client gallery review-screen: emptyBody | Go back to {name} and tap photos to pick them. | Kembali ke {name} dan ketuk foto untuk memilih. |
| Client gallery review-screen: missingMeta | Photo unavailable. Remove it from your picks. | Foto tidak tersedia. Hapus dari pilihan Anda. |
| Client gallery review-screen: quantityReadOnly | × {quantity} | × {quantity} |
| Client gallery review-screen: sentToastTitle | {name} sent | {name} dikirim |
| Client gallery review-screen: sentToastBody | Your photographer will see your picks. | Fotografer akan melihat pilihan Anda. |
| Client gallery review-screen: sentToastBodyOpen | Your photographer will see your picks. {remaining, plural, one {# place} other {# places}} can still be picked. | Fotografer akan melihat pilihan Anda. Sisa {remaining, plural, other {# tempat}} masih bisa Anda pilih. |
| Client gallery review-screen: groupClosed | Picks already sent | Pilihan sudah dikirim |
| Client gallery review-screen: limitReached | Pick limit reached | Batas pilihan tercapai |
| Client gallery review-screen: rateLimited | Too many changes. Try again in a moment. | Terlalu banyak perubahan, coba lagi sebentar. |
| Client gallery review-screen: failed | The picks weren’t saved. Try again. | Pilihan belum tersimpan. Coba lagi. |
| Client gallery review-screen: sendFailed | The picks weren’t sent. Try again. | Pilihan belum terkirim. Coba lagi. |
| Client gallery review-screen: confirmTitle | Send {name} picks? | Kirim pilihan {name}? |
| Client gallery review-screen: confirmDescription | The places left stay open after you send. | Sisa tempat tetap terbuka setelah dikirim. |
| Client gallery review-screen: confirmBody | You’ve picked {usage} of {limit} {unit}. {remaining} places are still open, and you can change your picks until your photographer locks them. | Anda baru memilih {usage} dari {limit} {unit}. {remaining} tempat sisanya tetap terbuka, dan pilihan masih bisa diubah sampai fotografer menguncinya. |
| Client gallery review-screen: confirmBack | Pick more | Pilih lagi |
| Client gallery review-screen: noteTitle | Note for your photographer | Catatan untuk fotografer |
| Client gallery review-screen: noteEdit | Edit note | Ubah catatan |
| Client gallery review-screen: noteAdd | Add note | Tambah catatan |
| Client gallery review-screen: remove | Remove {fileName} | Hapus {fileName} |
| Client gallery review-screen: quantityLabel | Quantity for {fileName} | Jumlah {fileName} |
| Client gallery viewer-pick-actions: pickFor | Pick for… | Pilih untuk… |
| Client gallery viewer-pick-actions: note | Note | Catatan |
| Client gallery viewer-pick-actions: noteLabel | Note for {fileName} in {groupName} | Catatan untuk {fileName} di {groupName} |
| Client gallery viewer-pick-actions: usage | {usage} of {limit} {unit} | {usage} dari {limit} {unit} |
| Client gallery viewer-pick-actions: hintOpen | tap to pick | ketuk untuk memilih |
| Client gallery viewer-pick-actions: hintPicked | already picked | sudah dipilih |
| Client gallery viewer-pick-actions: hintPickedQuantity | already picked × {quantity} | sudah dipilih × {quantity} |
| Client gallery viewer-pick-actions: sheetMeta | {fileName} · saved automatically | {fileName} · tersimpan otomatis |
| Client gallery viewer-pick-actions: pickedIn | Picked in: {entries} | Dipilih di: {entries} |
| Client gallery viewer-pick-actions: pickedQuantity | {name} × {quantity} | {name} × {quantity} |
| Client gallery viewer-pick-actions: pickedWithNote | {entry} · has a note | {entry} · ada catatan |
| Client gallery viewer-pick-actions: limitReached | Pick limit reached | Batas pilihan tercapai |
| Client gallery viewer-pick-actions: groupClosed | Picks already sent | Pilihan sudah dikirim |
| Client gallery viewer-pick-actions: rateLimited | Too many changes. Try again in a moment. | Terlalu banyak perubahan, coba lagi sebentar. |
| Client gallery viewer-pick-actions: refused | This photo can’t be picked. | Foto ini tidak bisa dipilih. |
| Client gallery viewer-pick-actions: failed | The pick wasn’t saved. Try again. | Pilihan belum tersimpan. Coba lagi. |

## 15. Owner gallery, client access and delivery summaries

**Where:** owner project gallery tabs and picks routes under `{workspace}/projects/{projectId}/gallery`.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Client access card | Client access / Link and password for the client. | Akses klien / Link dan kata sandi untuk klien. |
| Access actions | Change link / Change password / Copy link / Copy password / Link / Password / Expires / Inactive | Ganti link / Ganti kata sandi / Salin link / Salin kata sandi / Link / Kata sandi / Kedaluwarsa / Tidak aktif |
| Draft and archived notes | The client can’t open this link until the gallery is published. / The gallery is archived. The link can’t be opened or changed. | Klien belum bisa membuka link ini sampai galeri dipublikasikan. / Galeri diarsipkan. Link tidak bisa dibuka dan tidak bisa diganti. |
| Rotate-link confirmation | Change the gallery link? The old link will stop working. All shared links, including invoice links, will stop working. The password won’t change. Share the new link with the client. | Ganti link galeri? Link lama berhenti bekerja. Semua link yang sudah dibagikan, termasuk link invoice, tidak bisa dibuka lagi. Password tidak berubah. Bagikan link baru ke klien. |
| Selection card | Client selections / See the client’s photo selections and lock them when finished. / The client chooses photos through the gallery. | Pilihan klien / Lihat pilihan foto klien dan kunci setelah selesai. / Klien memilih foto lewat galeri. |
| Selection actions | View selections / Review selections / Lock selections / Close selections / Copy file names | Lihat pilihan / Tinjau pilihan / Kunci pilihan / Tutup pilihan / Salin nama file |
| Owner warning | The client can still change selections until they submit or you close the group. / {count} selected photos are no longer in Drive. They still count. | Klien masih bisa mengubah pilihan sampai mengirim atau kamu menutupnya. / {count} foto pilihan tidak ada lagi di Drive. Foto tetap dihitung. |
| Selection confirmation | Lock selections for {name}? The client can’t change them again. / Close selections for {name}? The group will be locked with the current selections. | Kunci pilihan {name}? Klien tidak bisa mengubahnya lagi. / Tutup pilihan {name}? Grup dikunci dengan pilihan saat ini. |
| Delivery card | Final files / Downloads for the client. / Publish final files / Mark complete | Hasil akhir / Unduhan untuk klien. / Publikasikan hasil akhir / Tandai selesai |
| Delivery readiness | No final files have synced yet. Create and map the Drive final-file subfolder, then sync the gallery. / The gallery must be published before the client can open final files. | Belum ada hasil akhir yang tersinkron. Buat dan petakan subfolder hasil akhir di Drive, lalu sinkronkan galeri. / Galeri harus dipublikasikan lebih dulu supaya klien bisa membuka hasil akhir. |
| Publish/complete consequence | The client can download through the same link and password. / The project becomes Delivered. / The gallery stays open while it remains published. | Klien bisa mengunduh lewat link dan password yang sama. / Status proyek menjadi Terkirim. / Galeri tetap terbuka selama masih dipublikasikan. |

The source comment says gallery-open tracking is unavailable; owner copy must not claim that the client opened the gallery. Public Drive/image-link limits remain governed by BR-ACC-005.

### 15.x Proposed rows (I6.7, pending Owner review)

These rows come from owner gallery strings that have no deck row yet. The English is a faithful rendering of the current Indonesian and is marked `PROPOSED (pending Owner review)` in the copy file. The Owner accepts, edits or replaces each row here before it becomes deck copy.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Project access card: copied | Copied | Disalin |
| Project access card: copyFailedTitle | Link couldn’t be copied | Link belum tersalin |
| Project access card: copyFailedBody | The text is selected. Copy it with Ctrl+C or ⌘C, or press and hold, then Copy. | Teksnya sudah ditandai. Salin dengan Ctrl+C atau ⌘C, atau tekan lama lalu Salin. |
| Project access card: rotatedToast | New link ready. Share it with the client. | Link baru siap. Bagikan ke klien. |
| Project access card: cancelledToast | The project was canceled, so the link can’t be changed. | Proyek dibatalkan, link tidak bisa diganti. |
| Project access card: failedToast | Couldn’t change the link. Try again. | Gagal mengganti link. Coba lagi. |
| Selection owner: cardNotPublishedNote | The client can choose once the gallery is published. | Klien baru bisa memilih setelah galeri dipublikasikan. |
| Selection owner: cardNoItems | This package has no photo selection items. | Paket proyek ini tidak punya item pilihan foto. |
| Selection owner: cardOpen | Selections per package item. | Pilihan per bagian paket. |
| Selection owner: cardReview | {count, plural, one {The client has sent one section.} other {The client has sent # sections.}} | {count, plural, one {Klien sudah mengirim satu bagian.} other {Klien sudah mengirim # bagian.}} |
| Selection owner: cardFinal | Selections are final. | Pilihan sudah final. |
| Selection owner: statusOpen | Open | Terbuka |
| Selection owner: statusSubmitted | Sent | Dikirim |
| Selection owner: statusLocked | Locked | Dikunci |
| Selection owner: usage | {usage} of {limit} {unit} | {usage} dari {limit} {unit} |
| Selection owner: usageOpen | {usage} of {limit} {unit} selected | {usage} dari {limit} {unit} dipilih |
| Selection owner: sentOn | sent {date} | dikirim {date} |
| Selection owner: defaultUnit | photos | foto |
| Selection owner: waitingTitle | Waiting for the client to choose | Menunggu klien memilih |
| Selection owner: waitingBody | The client hasn’t sent selections yet. | Klien belum mengirim pilihan. |
| Selection owner: sentBannerTitle | {names} sent their selections | {names} sudah dikirim klien |
| Selection owner: sentBannerBody | Review the selections, then lock them so they can’t change. | Periksa pilihan, lalu kunci agar tidak berubah. |
| Selection owner: detailSubtitle | Photos the client chose. | Foto yang klien pilih. |
| Selection owner: copiedTitle | File name list copied | Daftar nama file disalin |
| Selection owner: copyFailedTitle | List couldn’t be copied | Daftar belum tersalin |
| Selection owner: copyFailedBody | Copy the file names manually. | Salin nama file secara manual. |
| Selection owner: openAlertTitle | Selections are still open | Pilihan masih terbuka |
| Selection owner: summaryTitle | Summary | Ringkasan |
| Selection owner: summaryStatus | Status | Status |
| Selection owner: summaryUsed | Used | Terpakai |
| Selection owner: summaryTime | Time | Waktu |
| Selection owner: summaryNotes | Notes | Catatan |
| Selection owner: notesPhotos | {count, plural, one {# photo with a note} other {# photos with notes}} | {count, plural, other {# foto bercatatan}} |
| Selection owner: timeChanged | Changed {when} | Diubah {when} |
| Selection owner: timeSent | Sent {when} | Dikirim {when} |
| Selection owner: timeLocked | Locked {when} | Dikunci {when} |
| Selection owner: timeNone | No selections yet | Belum ada pilihan |
| Selection owner: picksTitle | Chosen photos | Foto pilihan |
| Selection owner: picksMetaCount | {picks, plural, one {# photo} other {# photos}} | {picks, plural, other {# foto}} |
| Selection owner: picksMetaCountNotes | {picks, plural, one {# photo} other {# photos}} · {withNotes, plural, one {# with a note} other {# with notes}} | {picks, plural, other {# foto}} · {withNotes, plural, other {# dengan catatan}} |
| Selection owner: picksMetaQuantity | {picks, plural, one {# photo} other {# photos}} · print quantity is written on each photo | {picks, plural, other {# foto}} · jumlah cetak tertulis di tiap foto |
| Selection owner: clientNote | Client note | Catatan klien |
| Selection owner: quantity | × {quantity} | × {quantity} |
| Selection owner: missingOnPhone | Missing in Drive | Hilang di Drive |
| Selection owner: emptyTitle | No photos chosen yet | Belum ada foto dipilih |
| Selection owner: emptyBody | The client hasn’t chosen photos for this section yet. | Klien belum memilih foto untuk bagian ini. |
| Selection owner: lockBody | Once locked, the selections can’t be reopened, and add-ons can’t raise this group’s limit. | Setelah dikunci, pilihan tidak bisa dibuka lagi dan add-on tidak bisa menambah batas grup ini. |
| Selection owner: closeBody | The client hasn’t sent yet. The group will be locked with {usage} {unit} chosen and can’t be reopened. | Klien belum mengirim. Grup dikunci dengan {usage} {unit} terpilih dan tidak bisa dibuka lagi. |
| Selection owner: lockedToast | {name} locked | {name} dikunci |
| Selection owner: closedToast | {name} closed | {name} ditutup |
| Selection owner: staleToast | The selection status has changed. The page has reloaded. | Status pilihan sudah berubah. Halaman dimuat ulang. |
| Selection owner: lockFailed | Selections aren’t locked yet. Try again. | Pilihan belum terkunci. Coba lagi. |
| Owner delivery: itemCount | {count, plural, one {# file} other {# files}} | {count, plural, other {# file}} |
| Owner delivery: itemFiles | {count, plural, one {# file} other {# files}} {name} | {count, plural, other {# file}} {name} |
| SUPERSEDED (F-27 iteration 5): Owner delivery: publishedTitle| Published {when} | Dipublikasikan {when} |
| SUPERSEDED (F-27 iteration 5): Owner delivery: publishedMeta| The client can download {files}. | Klien bisa mengunduh {files}. |
| Owner delivery: completedTitle | Delivered {when} | Terkirim {when} |
| SUPERSEDED (F-27 iteration 5): Owner delivery: chipReady| Ready | Siap |
| Owner delivery: chipCompleted | Completed | Selesai |
| Owner delivery: headerMeta | Final files published {when} | Hasil akhir dipublikasikan {when} |
| SUPERSEDED (F-27 iteration 5): Owner delivery: publishTitle| Publish final files? | Publikasikan hasil akhir? |
| Owner delivery: completeTitle | Mark this project as delivered? | Tandai proyek terkirim? |
| Owner delivery: completeDescription | Project {title} will be marked Delivered. | Proyek {title} akan berstatus Terkirim. |
| SUPERSEDED (F-27 iteration 5): Owner delivery: refusedTitle| Final files can’t be published yet | Hasil akhir belum bisa dipublikasikan |
| SUPERSEDED (F-27 iteration 5): Owner delivery: refusedDescription| Check the following first. | Periksa hal berikut lebih dulu. |
| Owner delivery: reasonProjectStatus | This project’s status can’t be changed to Delivered. | Status proyek ini tidak bisa diubah menjadi Terkirim. |
| SUPERSEDED (F-27 iteration 5): Owner delivery: publishedToast| Final files published | Hasil akhir dipublikasikan |
| Owner delivery: completedToast | Project marked as delivered | Proyek ditandai terkirim |
| Owner delivery: staleToast | The project status has changed. Reload the page. | Status proyek sudah berubah. Muat ulang halaman. |
| Owner delivery: failedToast | Couldn’t save. Try again. | Gagal menyimpan. Coba lagi. |
| Gallery summary: groupUsage | {name} {usage}/{limit} | {name} {usage}/{limit} |
| Gallery summary: allLocked | all locked | semua dikunci |
| Gallery summary: allLockedMobile | All groups locked | Semua grup dikunci |
| Gallery summary: sent | {count, plural, one {# sent} other {# sent}} | {count, plural, other {# dikirim}} |
| Gallery summary: sentMobile | {count, plural, one {# group sent} other {# groups sent}} | {count, plural, other {# grup dikirim}} |
| Gallery summary: open | open | terbuka |
| Gallery summary: openMobile | The client is choosing | Klien sedang memilih |
| Gallery summary: item | {count} {name} | {count} {name} |
| Gallery summary: ready | {files} ready | {files} siap |
| Gallery summary: readyMobile | Ready to publish | Siap dipublikasikan |
| SUPERSEDED (F-27 iteration 5): Gallery summary: published| Published {when} | Dipublikasikan {when} |
| Final delivery screen: downloadAll | Download all ({count, plural, one {# photo} other {# photos}}) | Unduh semua ({count, plural, other {# foto}}) |
| Final delivery screen: pickSeveral | Choose several | Pilih beberapa |
| Final delivery screen: readyTitle | Final photos are ready | Hasil akhir sudah tersedia |
| Final delivery screen: readyBody | Download one by one, several, or all at once. | Unduh satu per satu, beberapa, atau semuanya sekaligus. |
| Final delivery screen: cardTitle | Final photos | Foto hasil akhir |
| Final delivery screen: groupMeta | {count, plural, one {# file} other {# files}} · {name} | {count, plural, other {# file}} · {name} |
| Final delivery screen: groupTab | {name} · {count} | {name} · {count} |
| Final delivery screen: editedMeta | {count, plural, one {# edited photo} other {# edited photos}} | {count, plural, other {# foto hasil edit}} |
| Final delivery screen: printMeta | {count, plural, one {# print file} other {# print files}} | {count, plural, other {# file cetak}} |
| Final delivery screen: kindLabel | File type | Jenis file |
| Final delivery screen: editedTab | Edited · {count} | Hasil edit · {count} |
| Final delivery screen: printTab | Print · {count} | Cetak · {count} |
| Final delivery screen: confirmTitle | Download all {count, plural, one {# photo} other {# photos}}? | Unduh semua {count, plural, other {# foto}}? |
| Final delivery screen: confirmDescription | Your browser downloads the files one at a time. | Peramban Anda mengunduh file satu per satu. |
| Final delivery screen: confirmBody | If asked, allow multiple downloads. Keep this page open until it finishes. | Jika diminta, izinkan unduhan berganda. Jangan tutup halaman ini sampai selesai. |
| Final delivery screen: confirm | Download all | Unduh semua |
| Final delivery screen: progressTitle | Downloading final photos | Mengunduh hasil akhir |
| Final delivery screen: running | Running | Berjalan |
| Final delivery screen: progress | {done} of {total} photos done | {done} dari {total} foto selesai |
| Final delivery screen: stop | Stop downloads | Hentikan unduhan |
| Final delivery screen: failedTitle | {count, plural, one {# photo couldn’t be downloaded} other {# photos couldn’t be downloaded}} | {count, plural, other {# foto gagal diunduh}} |
| Final delivery screen: failedBody | {names} couldn’t be downloaded. The other photos were saved. | {names} tidak bisa diunduh. Foto lain sudah masuk. |
| Final delivery screen: failedBadge | Failed | Gagal |
| Final delivery screen: failedMeta | Couldn’t download | Gagal diunduh |
| Final delivery screen: selectedTitle | {count, plural, one {# photo selected} other {# photos selected}} | {count, plural, other {# foto dipilih}} |
| Final delivery screen: downloadSelected | Download {count, plural, one {# photo} other {# photos}} | Unduh {count, plural, other {# foto}} |
| Final delivery screen: viewerMeta | Final photos · {kind} · {position} of {total} | Hasil akhir · {kind} · {position} dari {total} |
| Final delivery screen: downloadPhoto | Download photo | Unduh foto |
| Final delivery screen: tileSelect | Select {fileName} | Pilih {fileName} |
| Final delivery screen: downloadMenu | Download options | Pilihan unduhan |
| Final delivery screen: viewerMissing | This photo isn’t available. | Foto ini tidak tersedia. |
| Final delivery screen: emptyKind | No files here yet. | Belum ada file di sini. |
| Owner gallery: photoCounts | {proof} selection photos · {finished} final files | {proof} foto pilihan · {finished} hasil akhir |
| Owner gallery: photoCountsMissing | {proof} selection photos ({missing} missing) · {finished} final files | {proof} foto pilihan ({missing} hilang) · {finished} hasil akhir |
| Owner gallery: proofCount | {count, plural, one {# selection photo} other {# selection photos}} | {count, plural, other {# foto pilihan}} |
| Owner gallery: sourceFinished | {count} final files | {count} hasil akhir |
| Owner gallery: kindLowerProof | selection | pilihan |
| Owner gallery: kindLowerEdited | edited | hasil edit |
| Owner gallery: kindLowerPrint | print | cetak |
| Owner gallery: segmentLabel | {kind} {count} | {kind} {count} |
| Owner gallery: allPhotosDescription | {project} · {totals} | {project} · {totals} |
| Owner gallery: menuSheetMeta | {status} · {project} | {status} · {project} |
| Owner gallery: publishDescription | {body} {expiry} | {body} {expiry} |
| Owner gallery: galleryMenu | Gallery menu | Menu galeri |
| Owner gallery: renameFolder | Edit folder | Edit folder |
| Owner gallery: renameDialogTitle | Edit folder | Edit folder |
| Owner gallery: renameDialogDescription | The folder name and the subfolders that hold final files. | Nama folder dan subfolder yang berisi hasil akhir. |
| Owner gallery: renamedTitle | Folder saved | Folder disimpan |
| Owner gallery: mappingTitle | Final-file subfolders | Subfolder hasil akhir |
| Owner gallery: mappingHelper | Choose the Drive subfolder for each package item. Subfolders you don’t choose stay selection photos. | Pilih subfolder Drive untuk tiap item paket. Subfolder yang tidak dipilih tetap foto pilihan. |
| Owner gallery: mappingNone | Not chosen | Belum dipilih |
| Owner gallery: mappingNoFolders | No subfolders yet. Sync this folder first, then map them here. | Belum ada subfolder. Sinkronkan folder ini dulu, lalu petakan di sini. |
| Owner gallery: mappingNoItemsTitle | This package has no items for selection photos yet | Paket proyek ini belum punya item untuk pilihan foto |
| Owner gallery: mappingNoItemsBody | Add items in Package items first. | Tambahkan item di Isi paket dulu. |
| Owner gallery: mappingNoItemsAction | Open package items | Buka Isi paket |
| Owner gallery: mappingLoadFailed | Subfolders couldn’t be loaded. Try again. | Subfolder belum bisa dimuat. Coba lagi. |
| Owner gallery: newFoldersTitle | {count, plural, one {# new subfolder} other {# new subfolders}} in {source} | {count, plural, other {# subfolder baru}} di {source} |
| Owner gallery: newFoldersBody | {folders}. Map them to package items if they hold final files. | {folders}. Petakan ke item paket bila berisi hasil akhir. |
| Owner gallery: mapFolders | Map | Petakan |
| Owner gallery: cancelledAlertTitle | Project canceled | Proyek dibatalkan |
| SUPERSEDED (F-27 iteration 5): SUPERSEDED (F-27 iteration 5): Owner gallery: archivedAlertTitle| Gallery archived | Galeri diarsipkan |
| Owner gallery: createFolderTitle | Google Drive folder | Folder Google Drive |
| Owner gallery: createFolderHelper | Optional. You can also add one later on the gallery page. | Opsional. Bisa juga ditambahkan nanti di halaman galeri. |
| Owner gallery: createFolderInUseConfirm | Create gallery anyway | Tetap buat galeri |
| Owner gallery: createdWithFolderBody | The Google Drive folder is syncing. | Folder Google Drive sedang disinkronkan. |
| Owner gallery: previewPosition | {position} of {total} | {position} dari {total} |
| Owner gallery: previewMissingBadge | Missing | Hilang |
| Owner gallery: refusedHasPicks | The client has already chosen photos from this folder. | Ada foto dari folder ini yang sudah dipilih klien. |
| Owner gallery: crumbFolders | {folders, plural, =0 {· {photos} photos} other {· # folders · {photos} photos}} | {folders, plural, =0 {· {photos} foto} other {· # folder · {photos} foto}} |
| Header step and menu label (P7, BOOKED/SHOOTING menu item) | Mark as delivered | Tandai terkirim |
| Confirm dialog body | The client can still open the gallery. | Galeri tetap bisa dibuka klien. |
| Confirm button | Mark as delivered | Tandai terkirim |
| Disabled hint, no finished file, AC-GFL-017 | No final files are synced yet. Sync the final-files folder first. | Belum ada hasil akhir yang tersinkron. Sinkronkan folder hasil akhir dulu. |
| DELIVERY_REFUSED toast title, A-6 | This project can’t be marked as delivered yet | Proyek belum bisa ditandai terkirim |
| DELIVERY_REFUSED toast body | No final files are synced yet. | Belum ada hasil akhir yang tersinkron. |
| P7 row, AC-GFL-019 | {edited} edited photos · {print} print photos · visible to the client | {edited} Foto edit · {print} Foto cetak · terlihat oleh klien |
| P7 status | Ready to download | Siap diunduh |
| P4 row, AC-GFL-006 | Delivered {when} · {edited} edited photos · {print} print photos | Terkirim {when} · {edited} Foto edit · {print} Foto cetak |
| P4 status | Delivered | Terkirim |
| No synced finished file | No final files are synced yet. Create a final-files subfolder in Drive, map it to a package item in Edit folder, then sync the gallery. | Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri. |

### 15.y Tandai selesai — DELIVERED to COMPLETED (restored in F-27 iteration 6)

The iteration 5 draft removed these rows by mistake and reused the `delivery.complete*` keys for *Tandai terkirim*. The original approved wording is restored under new keys (`delivery.finish*`, `finishedToast`, `finishStaleToast`); the confirm has no body, because the original body described a publish that ADR-028 removed.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Header step on a DELIVERED project (`delivery.finish`) | Mark complete | Tandai selesai |
| Confirm title (`delivery.finishTitle`) | Mark the project complete? | Tandai proyek selesai? |
| Confirm description (`delivery.finishDescription`) | Project {title} will be marked Completed. | Proyek {title} akan berstatus Selesai. |
| Confirm button | Mark complete | Tandai selesai |
| Success toast (`delivery.finishedToast`) | Project marked complete | Proyek ditandai selesai |
| Stale status toast (`delivery.finishStaleToast`) | The project status has changed. Reload the page. | Status proyek sudah berubah. Muat ulang halaman. |

## 16. Add-ons

**Where:** built project add-on card, form, action menu and confirmations. This is owner-side copy; the source explicitly says the description is not for the client.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Card and empty state | Add-on / Extra requested by the client. / No add-ons yet. Add one when the client requests extra photos or services. | Add-on / Tambahan yang klien minta. / Belum ada add-on. Tambahkan saat klien minta foto atau layanan ekstra. |
| Actions and statuses | Add add-on / Approve / Delete draft / Cancel add-on / Draft / Approved / Cancelled / No group | Tambah add-on / Setujui / Hapus draf / Batalkan add-on / Draf / Disetujui / Dibatalkan / Tanpa grup |
| Form | Add an add-on / An add-on increases the client’s selection limit after approval. / Description / Quantity / Unit price / Total / Save draft | Tambah add-on / Add-on menambah batas pilihan klien setelah disetujui. / Deskripsi / Jumlah / Harga satuan / Total / Simpan draf |
| Helpers | Shown in the add-on list, not to the client. / Whole-number quantity. / Full rupiah amount. / This group’s limit increases after approval. | Tampil di daftar add-on, tidak untuk klien. / Bilangan bulat. / Rupiah penuh. / Batas grup ini naik setelah add-on disetujui. |
| Locked group | {names} is locked, so the add-on can’t increase its limit. Add-ons without a group can still be created. | {names} sudah dikunci, jadi add-on tidak bisa menambah batasnya. Add-on tanpa grup tetap bisa dibuat. |
| Approval | Approve this add-on? / The {group} limit increases from {from} to {to}. / Submitted selections reopen so the client can add photos and send again. / No invoice has been created. | Setujui add-on? / Batas {group} naik dari {from} menjadi {to}. / Pilihan yang sudah dikirim dibuka lagi supaya klien bisa menambah foto dan mengirim ulang. / Belum ada invoice dibuat. |
| Cancellation | Cancel this add-on? / The {group} limit drops from {from} to {to}. Cancellation is refused if the client selected more than {to} {unit}. / This add-on does not change the client’s selection limit. | Batalkan add-on? / Batas {group} turun dari {from} menjadi {to}. Pembatalan ditolak jika klien sudah memilih lebih dari {to} {unit}. / Add-on ini tidak mengubah batas pilihan klien. |
| Refusal and recovery | Add-on can’t be cancelled. The limit would be lower than the client’s selections. Ask the client to remove photos first. / Try again. | Add-on belum bisa dibatalkan. Batas akan lebih kecil dari pilihan klien. Minta klien melepas foto lebih dulu. / Coba lagi. |
| Field errors | Description is required. / Quantity must be at least 1 and a whole number. / Enter a valid price in whole rupiah. / This group is locked. Choose another group or no group. | Deskripsi wajib diisi. / Jumlah minimal 1 dan harus bilangan bulat. / Isi harga yang valid dalam rupiah bulat. / Grup ini sudah dikunci. Pilih grup lain atau tanpa grup. |

Approval changes the selection limit only for an unlocked target group. It does not create an invoice, send a message or collect payment.

## 17. Global not-found and product primitives

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Global 404 | 404 / Page not found / This page isn’t available. / Go to Shutrly | 404 / Halaman tidak ditemukan / Halaman ini tidak tersedia. / Ke Shutrly |
| Stepper accessible actions | Decrease / Increase | Kurangi / Tambah |

The stepper labels are included because they are shipped product controls, not story/demo copy.

### 17.1 Page not found inside a workspace (F-24)

Shown inside the workspace shell when a page or record under `/w/{workspaceId}` does not exist (AC-SFX-011, 012). Source: `page-not-found-screen.copy.ts`.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Title · Approved (Owner, 2026-10-12) | Page not found | Halaman tidak ditemukan |
| Body · Approved (Owner, 2026-10-12) | This page doesn’t exist or was removed. | Halaman ini tidak ada atau sudah dihapus. |
| Back to section · Approved (Owner, 2026-10-12) | Back to {section} | Kembali ke {section} |
| Back to dashboard · Approved (Owner, 2026-10-12) | Back to dashboard | Kembali ke dasbor |

### 17.2 Loading titles and pending labels (F-24)

Skeleton card titles and *load more* pending labels, so a loading screen follows the active language (BR-L10N-002). The *Services*, *Categories* and *Package items* skeletons reuse the approved tab labels (`tabServices`, `tabCategories`, `tabItems`). Sources: `catalog-copy.copy.ts`, `project-copy.copy.ts`, `client-copy.copy.ts`, `team-copy.copy.ts`.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Service page loading title (`loadingService`) · Approved (Owner, 2026-10-12) | Loading service… | Memuat layanan… |
| Project page and New project loading title (`loadingProject`) · Approved (Owner, 2026-10-12) | Loading project… | Memuat proyek… |
| Clients and Team *load more* pending label (`loadingMore`) · Approved (Owner, 2026-10-12; same as the project list) | Loading… | Memuat… |

## 18. Deferred surfaces and editorial coverage

### Scope boundaries

Invoice/payment pages, team fees and real WhatsApp sharing do not yet have complete implemented page specs on this branch. Add-ons are built and covered in section 16. Billing-page copy must still be drafted from its approved feature spec rather than inventing online payment, due dates or financial actions.

The root `/` scaffold placeholder is replaced by the public landing page in section 19. Keep the existing placeholder row below only as the historical replacement wording; it is no longer the public root-page surface.

| Element | English | Bahasa Indonesia |
|---|---|---|
| Existing root placeholder status (historical; replaced by landing page) | Record your shoot details | Catat detail pemotretanmu |

This is wording for the existing placeholder only, not a new landing-page design, CTA or redirect. The wordmark `shutrly.` and copyright retain brand identity.

### Source-to-section review map

| Source family / audit finding | Deck section | Review treatment |
|---|---|---|
| Owner nav/shell/layout, shared UI wrappers and route errors | 1, 4, 17 | Shared actions; full-page contexts; demo literals excluded below |
| Auth screens/forms, profile, password visibility and auth error mappings | 2, 3 | All existing page/state families |
| Workspace onboarding/settings/switcher and field errors | 4 | Complete field/state families |
| Catalog copy, detail parent, mobile tabs, skeletons, booking type array (OCM-01–04) | 5 | Visible labels plus empty/loading/validation states |
| Clients copy, table/skeleton headings and validation helper (OCM-05–07) | 6 | Visible, accessible and interpolated feedback |
| Projects copy and field helper (OCM-08) | 7, 8 | Project/session/package validation and team assignments |
| Team copy and system default roles (OCM-12) | 8 | Default role equivalents; preserve custom roles pending classification |
| Photo-source copy | 9 | Guide, warnings, dialogs and errors |
| Gallery copy and translated-string anchor (OCM-13) | 10 | Whole-message summaries, visibility and state consequences |
| Communications editor, preview, variable chips and five defaults (OCM-10) | 11 | Preserve variables, masking and logical template count |
| Auth email copy | 12 | Full email components; recipient policy pending |
| Default item definitions (OCM-11) | 5.7 | Paired platform defaults; no historical overwrite |
| Icon-button unread badge (OCM-09) | 1 | Complete count announcement |
| Locale assumptions (OCM-14–22) | Cross-cutting notes | HTML/providers/formatting are technical requirements, not extra text rows |
| Owner-authored text and language hints | 13 | Single-language custom templates and owner-only add-on descriptions; no paired authoring |
| Client access/selection/delivery journey | 14 | Built routes and copy modules; partial-send and download consequences retained |
| Owner client-access card, selection-owner text, gallery summaries and delivery card | 15 | Built owner gallery tabs, cards, picks routes and dialogs |
| Add-on card, form, menu, validation and confirmations | 16 | Built owner project surface; no client-facing offer inferred |
| Global not-found page and stepper actions | 17 | Built product copy; stepper stories excluded |
| Public landing page, rotating headline, waitlist form and root metadata | 19 | Added to bilingual scope by Owner request 2026-10-10; see section 19 |

The deck consolidates repeated actions, desktop/mobile duplicates and common error messages instead of reproducing every source key. Tables are editorial review units, not a generated source-key catalog; implementation must map every actual consumer and state back to an approved row. No claim of full runtime coverage is made until browser and data review.

### Deliberate exclusions

- Storybook/explorer content and demo data embedded under shared `story`, modal `small/medium/large`, bottom-sheet sample forms/actions and tooltip demos. These must not be promoted into production copy. Keep the reusable real control labels in section 1.
- Identity values: Shutrly, Google Drive, WhatsApp, provider/social brands, client/project/brand/folder/file names, email addresses, invoice identifiers, token URLs, generated password words and neutral separators. Descriptive content versions still need review; preserving a name is not permission for cross-language fallback.
- Developer exceptions, API health output, stable error codes/enums, test fixtures, internal date calculations and historical migrations.
- Invented new feature copy for unapproved billing, fees, automatic sending, AI translation or unsupported gallery actions. Built add-on copy is in section 16.

### Review decisions before adopting this deck

1. Confirm the proposed fully localized terminology and consistent casual `kamu` tone.
2. Review existing-page wording and verified limits/consequences. Future drafts remain separately gated.
3. Resolve preference persistence, recipient language and restore-default language scope.
4. Decide authored-title classification, translation readiness and historical-record/snapshot handling.
5. Map approved rows to source consumers, update Pencil frames/HTML exports, then write technical design and an implementation plan.
6. Landing copy is included in the bilingual scope as of 2026-10-10 (Owner request); review the public-page switch placement and preference behavior with the landing implementation.

References: [feature spec](spec.md), [acceptance criteria](acceptance-criteria.md), [copy inventory](copy-inventory.md), [outside-module audit](copy-outside-modules-audit.md), [localization policy](../../product/localization.md), [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md). Writing guidance: project Rama Copywriting and UX Writing skills. No source code, translations in storage or Pencil frames are changed by this deck.

## 19. Public landing page — `/`

**Sources:** `src/features/landing/ui/landing-page/landing-page.copy.ts`, `src/features/landing/ui/rotating-headline/rotating-headline.copy.ts`, `src/features/landing/ui/waitlist-form/waitlist-form.copy.ts`, `src/app/page.copy.ts`, plus the adjacent landing components for rendered placement and state behavior.

| Element / context | English | Bahasa Indonesia |
|---|---|---|
| Wordmark | shutrly | shutrly |
| Launch-status badge | Coming soon | Segera hadir |
| Audience overline | YOUR STUDIO, IN ONE PLACE | STUDIO-MU, DI SATU TEMPAT |
| Hero description | A workspace to manage your projects, photo selections, and invoices. All in one workspace. | Ruang kerja untuk mengelola proyek, pilihan foto, dan tagihanmu. Semuanya dalam satu ruang kerja. |
| Laptop image accessible name | Shutrly’s project list on a laptop | Daftar proyek Shutrly di laptop |
| Phone image accessible name | Shutrly’s project list on a phone | Daftar proyek Shutrly di ponsel |
| Rotating headline — prefix | Less | Lebih sedikit |
| Rotating headline — rotating words | busywork. / paperwork. / back-and-forth. | kerja admin. / urusan kertas. / bolak-balik. |
| Rotating headline — stable line | More photography. | Lebih banyak waktu untuk fotografi. |
| Rotating headline — accessible name | Less busywork. More photography. | Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi. |
| Email field accessible label | Email address | Alamat email |
| Email placeholder | Enter your email | Masukkan emailmu |
| Submit — desktop | Join the waitlist | Gabung daftar tunggu |
| Submit — mobile | Join waitlist | Gabung daftar tunggu |
| Submitting | Joining… | Sedang bergabung… |
| Launch notification promise | Get notified when Shutrly launches. No spam. | Dapatkan kabar saat Shutrly diluncurkan. Tanpa spam. |
| Privacy/removal note | We only use your email to tell you about the launch. It’s kept with our email provider, never shared, and removed whenever you ask at {contactEmail}. | Emailmu hanya dipakai untuk memberi kabar tentang peluncuran Shutrly. Email disimpan di penyedia email kami, tidak dibagikan, dan akan dihapus kalau kamu minta lewat {contactEmail}. |
| Hidden bot-field label | Leave this field empty | Kosongkan kolom ini |
| Required-email error | Enter your email address. | Masukkan alamat emailmu. |
| Invalid-email error | Enter a valid email address, like name@example.com. | Masukkan alamat email yang valid, misalnya nama@example.com. |
| Too-long-email error | This email is too long. Use one with at most 254 characters. | Email ini terlalu panjang. Gunakan alamat maksimal 254 karakter. |
| Server/network failure | That didn’t work. Please try again. | Belum berhasil. Coba lagi. |
| Rate-limit error | Too many attempts. Please try again in a moment. | Terlalu banyak percobaan. Coba lagi sebentar. |
| Success title | You’re on the list. | Kamu sudah masuk daftar. |
| Success body | We’ll email you when Shutrly opens. | Kami akan mengirim email saat Shutrly dibuka. |
| Footer landmark accessible name | Footer | Footer |
| Footer copyright | © 2026 Shutrly | © 2026 Shutrly |
| Footer contact link | Contact | Kontak |
| Footer privacy link | Privacy | Privasi |
| Site/share name | Shutrly | Shutrly |
| Page title | Shutrly — Less busywork. More photography. | Shutrly — Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi. |
| Page description | A workspace for photographers to manage projects, client photo selections and invoices in one workspace. Join the waitlist. | Ruang kerja untuk fotografer mengelola proyek, pilihan foto klien, dan tagihan dalam satu ruang kerja. Gabung daftar tunggu. |
| Share-image alt text | Shutrly — Less busywork. More photography. A workspace for photographers to manage projects, photo selections and invoices. | Shutrly — Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi. Ruang kerja untuk fotografer mengelola proyek, pilihan foto, dan tagihan. |

The English hero description changes “All in one place” to “All in one workspace” in this deck. This is a claim-boundary correction: it describes the workspace without implying free storage, automatic sending/payments/sync, guaranteed time savings, or a finished end-to-end MVP. The metadata and share alt text retain the source meaning while avoiding a stronger unsupported promise.

The email address is an identity/contact value and remains `hello@shutrly.space` in both languages. `{contactEmail}` above represents that source value; it is a link target, not translated copy. “shutrly.”, the wordmark and identity names remain unchanged. The page is single-language at a time: selected EN or ID copy must be complete, with no cross-language fallback. The source modules currently contain English only; the Indonesian column is the reviewed target copy for implementation.
