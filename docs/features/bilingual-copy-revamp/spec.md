# Bilingual copy revamp

Status: DRAFT — voice, complete bilingual scope and bilingual user-authored copy approved; language behavior and legacy-data transition require review.
Date: 2026-10-06
Base: staging `bdab2c2`; branch `codex/bilingual-copy-revamp`.

## Approved Owner decisions

- English is the default language.
- Users can switch between English and Bahasa Indonesia, one language per screen.
- Both the photographer dashboard and client galleries support switching.
- All system-owned user-facing content must be localized; no page may mix English and Indonesian system copy (Owner 2026-10-06). This includes content outside `.copy.ts`, validation, loading, accessibility text, library-generated text, display formatting and platform-default content.
- User-authored descriptive content, including service/package descriptions and custom WhatsApp templates, must support both EN and ID versions (Owner 2026-10-06). Identity names and identifiers are preserved.
- Voice is casual and friendly. Indonesian addresses the reader as `kamu` or `-mu` when useful.
- Use natural local startup language: warmth, everyday verbs, concise task instructions, and clear recovery guidance.

## Goal and boundaries

Make existing Shutrly journeys easy to understand in either language without changing business behavior. Rewrite navigation, forms, helper text, state messages, confirmations, accessible labels and existing client-gallery text. Include existing auth emails and generated WhatsApp messages in localization coverage. Their recipient-language selection and treatment of existing customized templates must be specified before implementation; this is a behavior decision, not an exclusion from localization.

User-authored descriptive text, including service/package descriptions and custom message templates, supports paired EN/ID versions. Rendering selects the active language; it must not fall back to the other language. Preserve client names, brand names, project names, identifiers and external filenames. Brand names such as Shutrly, WhatsApp and Google Drive remain brand names in both locales. Existing free-text service/item/role titles require classification as an identity name or localizable display label before technical design; do not infer this from the current field name. Do not automatically translate or overwrite user content. System-owned default names, units, roles and templates must have EN/ID equivalents. Language selection must not silently change currency, financial rules, timezone, entitlements, project stages or permissions. No unrelated visual redesign, new marketing claims, schema change is approved by this document.

## Voice and writing rules

Write like a helpful colleague. Use short, concrete sentences and familiar verbs. Indonesian may use `buat`, `cek`, `pilih`, `pakai`, `belum` and occasional `yuk`. Use `nggak` sparingly in explanatory conversation; prefer precise wording for statuses, money, access restrictions and irreversible consequences. Avoid habitual `nih`, `dong`, `bestie`, emoji, exaggerated enthusiasm and elongated spelling.

English uses familiar international vocabulary with consistent en-US spelling, natural contractions where helpful, and sentence case. Match intent and tone across languages rather than translating word for word. Do not add promises or lose qualifications in either version.

Buttons name the next action. Empty states explain the situation and offer an available next step. Distinguish a first-use empty state from no search results or a failed load. Errors name the failed action and an available recovery step; explain the cause only when known. Success text confirms an actual completed action. Confirmations state the verified consequence before the action. No invented limits, recovery guarantees or claims that data is safe.

Accessible names, validation and loading text follow the active language. Keep interpolation values intact, provide grammatical singular/plural wording and avoid building sentences from translated fragments.

## Editorial copy deck

The proposed EN/ID wording is collected in one [copy deck](copy-deck.md), grouped by feature, verified page location and state. It includes validation outside copy modules, accessibility labels, platform defaults and recipient messages. Future surfaces and proposed terminology are explicitly marked for review; the deck is not approval for implementation or rollout behavior.

## Example copy direction

These examples illustrate voice; feature behavior must be checked before adoption.

| Context | English | Bahasa Indonesia |
|---|---|---|
| Create action | Create project | Buat proyek |
| First-use empty state | No projects yet. Let’s create your first one. | Belum ada proyek. Yuk, buat proyek pertamamu. |
| Gallery instruction | Pick your favorite photos. | Pilih foto favoritmu. |
| Save success | Changes saved. | Perubahan disimpan. |
| Save failure with retry | Couldn’t save your changes. Try again. | Perubahan belum tersimpan. Coba lagi. |
| No search results | No matches. Try another search. | Belum ketemu. Coba kata kunci lain. |

## Terminology proposal — review before adoption

Use one term per concept, aligned with the domain glossary. UI wording may be simpler than internal domain identifiers but must preserve distinctions.

| English | Indonesian proposal | Note |
|---|---|---|
| Project | Proyek | One client engagement |
| Gallery | Galeri | Client proofing/delivery surface |
| Client | Klien | No client account implied |
| Service | Layanan | A sellable package template |
| Session | Sesi pemotretan | Shorten to Sesi when context is clear |
| Team member | Anggota tim | No member login implied |
| Workspace | Workspace | Proposed familiar borrowed term |
| Invoice | Invoice | Proposed familiar borrowed term |
| Add-on | Tambahan | Qualify by feature context |
| Finished files | Hasil akhir | Separate from selectable proof photos |

## User-authored bilingual content

Approved scope: store and render EN/ID versions of descriptive product content and custom message templates. Values in template placeholders, such as client names, links, passwords and invoice identifiers, remain unchanged. Keep the same supported variables and business meaning in both versions.

Approved authoring direction: clearly label language fields/tabs, show completeness, and require both reviewed versions before bilingual exposure. Incomplete translation drafts may be retained; exact save/edit/readiness behavior needs design. This does not add a service draft/publish lifecycle, which remains outside catalog scope. The Owner writes or reviews each version. No automatic translation provider or AI translation workflow is approved.

Existing records need a deliberate migration and review process: identify their source language, collect the missing version and validate completeness before enabling bilingual exposure. Do not relabel Indonesian data as English, use cross-language fallback, erase user edits, or rewrite immutable project/invoice snapshots. Historical content that has only one language is an unresolved compatibility constraint; define an Owner-approved viewing/rollout policy before shipping.

Message template language is selected for the recipient, separately from the dashboard language. The two template versions must preserve the same required placeholder contract and be reviewed before use. Auth-email recipient locale and persistence across sessions remain separate decisions.

## Language behavior proposal — unresolved

All visible platform-owned defaults, including catalog item names/units, team-role defaults and default WhatsApp templates, must render in the active content language without overwriting customized data or immutable snapshots. Storage/versioning and recipient-language behavior still need design.

Recommend independent visitor preferences for dashboard and gallery, remembering an explicit choice and falling back to English. The Owner has approved English default and both switches, but has not yet approved storage scope, persistence across devices, workspace language precedence, behavior before login or gallery preference scope. Decide these before implementation.

Separately decide language for generated WhatsApp messages, auth emails and existing custom templates. UI language and recipient-message language must not be assumed identical. Locale formatting must retain existing currency/timezone semantics; display patterns require review.

## Source-of-truth alignment

Owner authorization on 2026-10-06 aligns the higher-authority documents. [Localization policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede earlier Indonesian-only/default-fallback instructions. Historical verification and release records are preserved.

Review affected feature specs, acceptance criteria and domain glossary for approved wording and language behavior. Preserve constitutional rules, especially truthful security copy and C-106: Shutrly builds messages; the Owner sends them.

Approved Pencil frames remain the visual authority. Update copy through Pencil tools only, then refresh the required HTML exports and INDEX before implementing affected screens. Missing exports are a stop condition. Layout fidelity work may change only class names and element nesting under repository rules.

Keep copy co-located in sibling `.copy.ts` modules and preserve the fixed architecture. Design the locale mechanism only after product decisions are settled and the installed Next.js guides have been read. Use next-intl under ADR-025; selection does not approve a persistence policy or schema. The dependency is not yet installed.

## Proposed execution sequence

1. Resolve terminology, preference persistence, recipient language, content readiness and legacy-data behavior.
2. Audit existing copy using [copy-inventory.md](copy-inventory.md), recording current string, context, proposed EN/ID pair, behavior source and review status. Inspect strings outside copy modules too.
3. Review shell, authentication and workspace copy first, then existing catalog/client/project/team flows, then client access/gallery and communications. Existing invoices are included where present; future features receive writing guidance only.
4. Review copy against behavior, update affected owning documents and Pencil frames, and refresh exports.
5. Write technical design, acceptance criteria and a task-by-task implementation plan in this feature folder. Follow test-first development and one commit per task.
6. Implement and verify bilingual journeys, then record release and handoff evidence.

## Verification criteria for implementation

- First visits render English on both surfaces; explicit language switching works according to the approved persistence policy.
- Switching preserves route, gallery authorization, selections and unsaved form values as specified by acceptance criteria.
- Each supported state has equivalent, reviewed EN/ID meaning with no mixed-language fallback. Missing translations block release rather than falling back to the other language.
- All findings OCM-01–22 in [the outside-module audit](copy-outside-modules-audit.md) are included in implementation coverage, with the historical migration/data constraints preserved.
- Every page is reviewed in English and Indonesian across normal, empty, loading, validation, error, success and confirmation states where available. Review includes portals, dialogs, mobile navigation and library-generated accessible text.
- Platform-owned default labels, units, roles and message content have both language versions; user-entered content follows its explicitly approved policy.
- Accessible labels, errors, toasts, loading text and confirmation dialogs use the active language.
- Dynamic values, counts and verified limits render correctly in both languages.
- Text fits approved desktop and mobile layouts; buttons remain readable and focus/keyboard behavior works.
- Bilingual user-authored content renders the matching version, preserves template-variable contracts and has no cross-language fallback. Existing records and immutable snapshots follow the approved transition policy.
- Identity names, currency and business invariants retain their meaning.
- Generated messages and emails follow their separately approved recipient-language policy.
- Meaningful locale behavior tests, representative end-to-end journeys and visual/accessibility checks pass before claiming completion.

## Sources and skills

Local guidance: constitution.md, coding-rules.md, domain/glossary.md and architecture/overview.md.
Installed project skills: `.claude/skills/rama-copywriting` and `.claude/skills/ux-writing`, exposed to Codex through `.agents/skills` symlinks.

Observed public examples, checked 2026-10-06; these are references for analysis, not internal brand guidelines or copied Shutrly copy:

- [Gojek products](https://www.gojek.com/id-id/products): everyday words and direct audience address.
- [Tokopedia seller guide 2024](https://assets.tokopedia.net/asts/Edukasi/Panduan_Memulai_Usaha_di_Tokopedia_2024_%28012024%29.pdf): practical steps and familiar borrowed terms; historical evidence.
- [tiket.com homepage](https://www.tiket.com/id-id): warm opening and concise action labels.
- [GoPay error help](https://gopay.co.id/bantuan/pengaturan-akun-aplikasi/mengapa-saya-mendapatkan-notifikasi-eror): conversational wording with recovery guidance.
