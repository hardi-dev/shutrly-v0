# Copy outside `.copy.ts` — audit

Date: 2026-10-06. Base: `8cd3f83`, branch `codex/bilingual-copy-revamp`.
Status: reviewed static findings; no application copy changed.

## Result

Confirmed 22 source files that need attention in the bilingual revamp: nine files containing direct UI/accessible copy, three containing persisted defaults, one depending on a translated word in string-processing logic, and nine containing display-language/locale assumptions. Three historical SQL backfills repeat persisted defaults. These counts describe files, not unique messages or separate defects.

The existing 96 `.copy.ts` files are not a complete inventory. The largest omitted message sets are the client and project validation helpers. Merely translating copy modules would leave errors, catalog labels, table headings, accessible names, saved defaults, and formatting partly Indonesian.

## Method and limits

- Walked 796 TypeScript/TSX implementation files under `src/`, excluding `.copy.ts`, co-located tests, stories and `.types.ts`, with the installed TypeScript parser. Inspected string/template literals, JSX text and object/property copy values.
- Cross-checked with `rg` for validation messages, server errors, locale providers, formatting, metadata, seed constants and consumers.
- Read the relevant source and traced selected findings to form rendering, table/skeleton rendering, gallery summaries, and default seeding/reset flows.
- Inspected `public/` (image assets only), relevant SQL backfills, ESLint copy rules and config consistency tests.
- This is static source review, not a browser pass or database-content audit. Runtime library messages, actual custom templates and existing persisted values need later verification. Tests, Storybook fixtures, docs, design exports, generated SQL snapshots and CLI-only developer text are not product-copy findings. No `.pen` file was read.

## A. Direct UI and accessible copy — nine files

| ID | Location | Confirmed copy | Impact and proposed action |
|---|---|---|---|
| OCM-01 | `src/app/(owner)/w/[workspaceId]/services/[serviceId]/page.tsx:34` | `Layanan` in `parent.label` | Service-detail parent navigation stays Indonesian. Reference an approved localized copy value. |
| OCM-02 | `src/features/booking/ui/booking-field-dialog/booking-field-dialog.tsx:27` | `Teks`, `Teks panjang`, `Angka`, `Tanggal`, `Ya/Tidak`, `Pilihan` | Six field-type labels live in an option array. Keep stable type IDs; localize display labels. |
| OCM-03 | `src/features/booking/ui/catalog-skeletons/catalog-skeletons.tsx:6` | `Layanan`, `Kategori`, `Item paket`, `Memuat layanan` | Loading-state section titles stay Indonesian. Match the translated final state. |
| OCM-04 | `src/features/booking/ui/catalog-tabs-bar/catalog-tabs-bar.tsx:16` | `Layanan`, `Kategori`, `Item paket` | Mobile tabs use local literals despite importing `CATALOG_COPY`. Move labels to localized copy, preserving IDs and navigation. |
| OCM-05 | `src/features/booking/ui/clients-table/clients-table.tsx:14` | `KLIEN`, `WHATSAPP`, `MEDIA SOSIAL`, accessible `Aksi` | Desktop headings and row-action column accessibility escape the copy inventory. WhatsApp remains a brand name; other labels need EN/ID. |
| OCM-06 | `src/features/booking/ui/clients-skeleton/clients-skeleton.tsx:10` | Same four column labels as OCM-05 | Duplicated loading-state copy can drift from the table. Use the same localized definitions where architecture allows. |
| OCM-07 | `src/features/booking/ui/client-field-error/client-field-error.ts:3` | Eight static messages plus duplicate-number interpolation and `(diarsipkan)` | Client name, social-link and duplicate-phone feedback stays Indonesian. Localize message factories; retain client names as data. Consumers include client dialog and social-links editor. |
| OCM-08 | `src/features/booking/ui/project-field-error/project-field-error.ts:1` | Quantity, client/service selection, title, notes, price, session, team, item and cancellation errors; `Isi ${fieldName}.` and `${fieldName} maksimal 200 karakter.` | Central omitted error family, used by project creation/editing, session dialog, package items, booking fields and cancellation. Move wording to localized copy, retain stable error keys and dynamic user-entered field names. Verify every stated limit against its domain constant. |
| OCM-09 | `src/ui/primitives/icon-button/icon-button.tsx:46` | Default badge label `belum dibaca` | Screen-reader label combines a caller label, count and this suffix. EN UI can still announce Indonesian. Localize the whole accessible message with count semantics. |

OCM-07 examples: `Isi nama klien.`, `Nama klien maksimal 100 karakter.`, `Isian ini tidak valid.`, `Tautan harus diawali https://`, `Akun ini sudah ada di daftar.`, `Pilih platform dari daftar.`, `Maksimal 10 media sosial.` and `Nomor ini sudah dipakai`.

OCM-08 includes wording-specific review needs beyond extraction: the generic fallback is `Masukkan angka yang valid.` even though the helper serves nonnumeric fields too; some messages omit a period; the maximum price and character limits are embedded in sentences. This audit does not establish a failing runtime path for the fallback, so assess it during behavior review rather than changing it automatically.

## B. Persisted defaults — three source files plus three SQL backfills

| ID | Location | Content | Handling required |
|---|---|---|---|
| OCM-10 | `src/features/communications/domain/default-templates/default-templates.ts:6` | Five full WhatsApp templates: gallery share, selection reminder, final delivery, invoice share, payment reminder | Defaults are seeded into workspace records and exposed as defaultContent by message-template flow. Decide recipient language, reset behavior and how existing edited templates are preserved. Treat content as template data, not runtime UI labels. |
| OCM-11 | `src/features/booking/domain/default-item-definitions/default-item-definitions.ts:4` | Four names (`Foto edit`, `Foto cetak`, `Jumlah orang`, `Durasi pemotretan`) and units (`foto`, `lembar`, `orang`, `jam`) | Seeded per workspace. Decide language for new defaults and existing system defaults without translating user edits or historical snapshots. |
| OCM-12 | `src/features/booking/domain/team-role/team-role.ts:5` | `Fotografer`, `Videografer`, `Asisten` | Seeded role names; preserve user-defined names and assignments. Decide new-workspace seed policy separately from interface language. |

Historical duplicates: `drizzle/0003_message_template_backfill.sql`, `drizzle/0007_item_definition_backfill.sql`, and `drizzle/0011_team_role_backfill.sql`.

`tests/config/message-template-backfill.test.ts` and `tests/config/item-definition-backfill.test.ts` assert alignment between defaults and historical migration text. Changing defaults without a deliberate versioning strategy can break these contracts. Do not rewrite historical migrations just to translate copy. No migrations were generated or run during this audit.

## C. Translation-dependent string processing — one file

**OCM-13:** `src/features/gallery/ui/gallery-text/gallery-text.ts:41` builds photo counts through `GALLERY_COPY.photoCounts(...).replace(" proof", ...)`.

The literal `proof` is both visible terminology and a processing anchor. Translating the copy independently can prevent the missing-photo suffix from being inserted. Plan a localized message factory that receives all counts, including missing count, rather than replacing a word inside translated output. Consumers are gallery cards and the photo section.

Other joins of user values with neutral punctuation (` · `, ` › `, commas, ranges) are composition sites to review for grammar and accessibility, not automatically missing translations. The auth-email renderer takes its human-readable wording from its sibling copy module; HTML wrappers and escaping are not omitted email copy.

## D. Locale and display assumptions — nine files

| ID | Location | Assumption | Required review |
|---|---|---|---|
| OCM-14 | `src/app/layout.tsx:20` | `<html lang="id">` | Active document language must match rendered copy, including first-visit English. This is language metadata, not a translatable sentence. |
| OCM-15 | `src/ui/providers/app-providers.tsx:16` | React Aria locale fixed to `id-ID` | Library-generated calendar/control/accessible text may remain Indonesian. Feed the approved active locale and verify runtime text. |
| OCM-16 | `src/ui/patterns/date-field/date-field.tsx:31` | Local `id-ID` provider and date formatters | Local provider overrides global locale; month/day names and accessible calendar labels need review. Keep ISO values and timezone semantics. |
| OCM-17 | `src/ui/primitives/time-field/time-field.tsx:20` | Local `id-ID` provider and 24-hour presentation | Review accessible segment labels and displayed separators. Preserve canonical HH:MM values; do not infer timezone or hour-cycle policy from language. |
| OCM-18 | `src/features/booking/domain/session/session.ts:6` | Indonesian date formatters and `:` → `.` display time | Locale-sensitive summaries are used in list/detail UI. Design presentation localization without changing scheduling/domain behavior. |
| OCM-19 | `src/features/gallery/domain/gallery-display/gallery-display.ts:3` | Three `id-ID` date/time formatters | Gallery expiry and sync dates stay Indonesian. Preserve `GALLERY_TIME_ZONE`. |
| OCM-20 | `src/features/booking/domain/idr-amount/idr-amount.ts:4` | Indonesian number grouping and `Rp` formatting; parser accepts dot grouping and rejects commas | Currency remains IDR. Formatter output is also used to prefill price inputs: blindly changing separators to English can break parsing or alter amounts. Decide compatible display/input policy first. |
| OCM-21 | `src/features/booking/domain/package-value/package-value.ts:59` | `formatQuantity` replaces decimal dot with comma | Manual locale formatting missed by an Intl-only search. Parser accepts dot/comma decimals; preserve exact decimal representation and package constraints. |
| OCM-22 | `src/features/communications/ui/template-problem-text/template-problem-text.ts:11` | `Intl.NumberFormat("id-ID")` for template character limit | Validation text from a copy module can still contain Indonesian-formatted numbers. Use the chosen display-number policy. |

## E. Reviewed exclusions and false positives

- `src/app/layout.tsx:15`: metadata title `Shutrly` is a brand name, not text requiring translation. No other literal metadata description was found in the source property scan.
- `src/features/gallery/domain/default-source/default-source.ts:5`: `Google Drive` is a provider brand name.
- `src/features/gallery/domain/gallery-password/gallery-password-words.ts`: Indonesian password-word data is part of generation, not interface copy. Do not regenerate passwords when language changes.
- Auth schema strings (`password.length`, `password.mismatch`, etc.) and workspace/gallery/booking validation strings are stable keys consumed by mapping functions, not sentences to translate in schemas.
- Developer exceptions such as `Resend failed` and `Auth form submit failed` flow to the generic route error boundary. `src/app/error.tsx` deliberately does not render `error.message`. No raw developer exception display was confirmed in this review.
- `en-CA` in schedule-clock and gallery-expiry is used for internal date calculation; workspace-name `toLocaleLowerCase("id-ID")` is identity normalization. Do not couple either to UI language.
- Empty alt text on decorative media, CSS strings, route fragments, SQL, error codes and domain enum values are not missing copy.
- User-entered names, folder names, role names and social labels are data. Preserve them; localized wrappers must not translate their values.

## Why lint missed these findings

`eslint/local-rules.mjs` checks nonempty JSXText and a fixed set of direct JSX attributes. It does not trace identifiers, nested objects, option arrays, `.ts` helpers or locale providers. Therefore `title={TITLES[variant]}`, `options={options}`, `columns={COLUMNS}`, `parent={{label: "Layanan"}}`, and a default function argument can pass while referencing inline human-readable strings.

Proposal for later tooling work: add targeted checks for label-bearing option/column objects and sibling-copy provenance, paired with an allowlist for data/brands/keys. Avoid a blanket ban on strings in domain/schema files. No lint rule was changed in this audit.

## Owner coverage decision — 2026-10-06

All OCM-01–22 findings are mandatory localization scope. A page must not mix English and Indonesian system copy. No item is deferred merely because it lives outside `.copy.ts` or originates in a library/default-data record. The exclusions above distinguish brand names, developer-only strings, stable keys and user data; they do not permit untranslated system text. Existing customized data and immutable snapshots need an explicit content-language policy before implementation.

## Revamp order

1. Include OCM-01–09 in the initial copy extraction and EN/ID review; give OCM-07/08 and accessible text explicit state coverage.
2. Address OCM-13 alongside gallery wording so count/missing messages do not rely on a translated anchor.
3. Settle OCM-10–12 default-data and recipient-language policy before choosing storage or migrations.
4. Settle OCM-14–22 locale and input-format behavior before implementing the switch; preserve exact money and scheduling invariants.
5. In later implementation, test representative validation states, loading/final-state consistency, badge accessibility, gallery counts, and locale-aware price round trips. Complete runtime/library and persisted-content checks before claiming complete bilingual coverage.
