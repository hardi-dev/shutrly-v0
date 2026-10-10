# Localization policy

Status: Approved scope; decisions resolved 2026-10-10; implementation pending.
Owner decisions: 2026-10-06.

## Languages and coverage

English (`en`) is the default. The photographer dashboard and client galleries allow an explicit switch to Bahasa Indonesia (`id`). A rendered page uses one language for all system-owned copy, including navigation, forms, validation, errors, loading, empty states, dialogs, toasts, accessible names, metadata, library-generated labels and platform defaults. Supported brands, identity names, identifiers and external filenames retain their original values; these are not translation failures.

The public landing page (F-19 `landing`) follows this policy too: English and Bahasa Indonesia with the same switch behavior and no cross-language fallback. This replaces the English-only landing exception of 2026-10-07 (Owner request, 2026-10-10).

Owner-authored text is stored and shown as written, in one language. Custom WhatsApp templates are single-language text sent as written; they have no EN/ID pair and are never translated automatically. Add-on descriptions are owner-only single text. Services, categories and item names have no description field. Free-text titles (services, categories, items, fields, sessions, team members, clients, workspace names, project titles, gallery source labels) are identities and are not translated. Only platform defaults have EN/ID versions: item definitions, units, default team roles and the five default message templates.

Nothing is released yet, so no legacy migration or backfill is required. Default message templates render in the owner's language until the owner edits them; restore-default returns the template to that default state.

Auth emails and generated WhatsApp messages are covered. Their recipient language must be specified independently of the dashboard language. Shutrly prepares messages; the Owner still sends them manually (C-106).

## Voice and invariants

Use concise, friendly, task-focused copy. Indonesian uses natural everyday verbs and `kamu`/`-mu` where useful; English uses natural international English with en-US spelling. Transcreate meaning, preserve qualifications and verified consequences, and do not add marketing promises. Overall product headlines emphasize the intended client-photo-selection to photographer-review/editing handoff; project administration is supporting context. Page headlines name the concrete task on that page, and supporting copy explains the mechanism that helps with it. Match present-tense claims to feature availability, distinguish template independence from explicit project edits, and qualify public-Drive access limits. Do not promise free storage, automatic sending/payments/sync, guaranteed time savings or a completed end-to-end MVP. Use [overview.md](overview.md) as the claim boundary and keep literal action labels concise. Terminology remains a proposal until reviewed in the [feature spec](../features/bilingual-copy-revamp/spec.md).

Language changes must preserve authorization, selected photos, unsaved form values and business semantics. Currency remains IDR; timezone, exact monetary values, financial calculations, entitlements and workflow states do not change with language. Display formatting and parsing must be designed together to avoid changing numeric values.

## Decisions resolved (Owner, 2026-10-10)

- Dashboard language is stored on the owner account (`user.locale`, default English). Before sign-in, a device cookie is used, then English.
- Client gallery language defaults to the owner's `user.locale`. A client can switch it; the choice is stored per device for that gallery and overrides the owner default.
- Recipient language for auth emails and WhatsApp messages is chosen by the owner per message, preselected to the owner's language. Dashboard language never sets recipient language.
- Owner-authored text rules as above. Default template wording is approved as written in the copy deck.

## Delivery

Use [ADR-025](../architecture/decisions/ADR-025-next-intl-bilingual-localization.md). The [feature spec](../features/bilingual-copy-revamp/spec.md), [acceptance criteria](../features/bilingual-copy-revamp/acceptance-criteria.md) and [outside-module audit](../features/bilingual-copy-revamp/copy-outside-modules-audit.md) define delivery coverage. Existing feature behavior remains authoritative; language-only instructions and Indonesian examples in older feature documents are superseded by this policy. Historical verification, release records and migrations remain historical evidence.
