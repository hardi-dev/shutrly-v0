# Localization policy

Status: Approved scope; implementation and rollout decisions pending.
Owner decisions: 2026-10-06.

## Languages and coverage

English (`en`) is the default. The photographer dashboard and client galleries allow an explicit switch to Bahasa Indonesia (`id`). A rendered page uses one language for all system-owned copy, including navigation, forms, validation, errors, loading, empty states, dialogs, toasts, accessible names, metadata, library-generated labels and platform defaults. Supported brands, identity names, identifiers and external filenames retain their original values; these are not translation failures.

Descriptions and custom WhatsApp templates authored by the Owner support paired EN/ID versions. Display the matching version without falling back to the other language. Do not automatically translate or overwrite customized content. Classify free-text item/service/role titles before deciding whether each is an identity or translated display label. Authoring both versions is an intentional bilingual editing context: language tabs/fields must be clearly identified; ordinary reader pages remain single-language.

Missing translations block bilingual release. Incomplete translation drafts may be retained, but the content cannot be exposed in both languages until reviewed versions are complete. This is a content-readiness requirement, not approval for a new service draft/publish lifecycle; [catalog scope](scope.md) still excludes that lifecycle. Define the save/edit/readiness behavior in technical design before implementation.

Auth emails and generated WhatsApp messages are covered. Their recipient language must be specified independently of the dashboard language. Shutrly prepares messages; the Owner still sends them manually (C-106).

## Voice and invariants

Use concise, friendly, task-focused copy. Indonesian uses natural everyday verbs and `kamu`/`-mu` where useful; English uses natural international English with en-US spelling. Transcreate meaning, preserve qualifications and verified consequences, and do not add marketing promises. Overall product headlines emphasize the intended client-photo-selection to photographer-review/editing handoff; project administration is supporting context. Page headlines name the concrete task on that page, and supporting copy explains the mechanism that helps with it. Match present-tense claims to feature availability, distinguish template independence from explicit project edits, and qualify public-Drive access limits. Do not promise free storage, automatic sending/payments/sync, guaranteed time savings or a completed end-to-end MVP. Use [overview.md](overview.md) as the claim boundary and keep literal action labels concise. Terminology remains a proposal until reviewed in the [feature spec](../features/bilingual-copy-revamp/spec.md).

Language changes must preserve authorization, selected photos, unsaved form values and business semantics. Currency remains IDR; timezone, exact monetary values, financial calculations, entitlements and workflow states do not change with language. Display formatting and parsing must be designed together to avoid changing numeric values.

## Decisions still needed before implementation

- Preference persistence, scope, precedence and behavior across dashboard, gallery and authentication. English is the initial default; browser detection must not silently override it.
- Recipient-language selection for email and WhatsApp, and the language scope of template restore-default actions.
- Legacy records and immutable snapshots: collect missing translations without relabeling, overwriting customized data or changing historical facts. Agree the viewing/rollout policy before shipping.
- Classification of existing free-text titles, authoring/readiness behavior, and final terminology.

## Delivery

Use [ADR-021](../architecture/decisions/ADR-021-next-intl-bilingual-localization.md). The [feature spec](../features/bilingual-copy-revamp/spec.md), [acceptance criteria](../features/bilingual-copy-revamp/acceptance-criteria.md) and [outside-module audit](../features/bilingual-copy-revamp/copy-outside-modules-audit.md) define delivery coverage. Existing feature behavior remains authoritative; language-only instructions and Indonesian examples in older feature documents are superseded by this policy. Historical verification, release records and migrations remain historical evidence.
