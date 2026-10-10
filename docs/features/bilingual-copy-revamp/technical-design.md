# Bilingual copy revamp — technical design

Status: DRAFT — for Owner review. Items marked **Proposed — needs Owner** are not approved.
Date: 2026-10-10
Feature: F-22 `bilingual-copy-revamp` · Branch `codex/bilingual-copy-revamp`
Sources: [spec](spec.md) (› *Approved Owner decisions*, › *Language preference decisions (Owner, 2026-10-10)*), [acceptance criteria](acceptance-criteria.md), [outside-module audit](copy-outside-modules-audit.md), [copy deck](copy-deck.md), [localization policy](../../product/localization.md), BR-L10N-001…006, [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md), [ADR-010](../../architecture/decisions/ADR-010-tailwind-react-aria.md), [ADR-023](../../architecture/decisions/ADR-023-client-gallery-sessions-and-public-limits.md), [ADR-024](../../architecture/decisions/ADR-024-single-non-production-database.md), constitution, coding rules, architecture overview.

## Copy authoring rule (Owner, 2026-10-10)

- Every user-facing string in English and Indonesian is written by Codex CLI, not by Claude or any planning agent. The source of truth is `docs/features/bilingual-copy-revamp/copy-deck.md`, produced by Codex runs from a written brief.
- Implementers copy strings verbatim from the approved deck section into the sibling `*.copy.ts` file. They do not rephrase, translate, or add strings.
- If a needed string is missing from the deck, stop that task and ask Codex (new brief, same deck) to add it. Do not write the string in code, plans, or chat.
- Default template text (EN and ID) comes from deck section 11.4. Auth email text comes from deck section 12. Landing text comes from deck section 19.
- Placeholders such as `{count}` and `{filename}` and identity values (Shutrly, WhatsApp, Google Drive) are kept exactly as in the deck.
- The Owner reviews the deck before implementation. Claude may verify that keys, placeholders and tests match the deck, but may not change the wording.

## 1. Context and scope

Shutrly renders Indonesian system copy today (`<html lang="id">`, React Aria `id-ID`, Indonesian `.copy.ts` modules, Indonesian seeded defaults). F-22 makes English the default and adds an explicit English/Bahasa Indonesia switch on the owner dashboard, the auth screens, the landing page and the client gallery, with one language per screen and no cross-language fallback. This design covers locale resolution and persistence, the next-intl integration, the message catalog and its completeness gate, locale-aware formatting and parsing, platform defaults (message templates, item definitions, team roles), the recipient-language contract for generated messages and auth emails, and the database changes those need. It changes no business behavior: currency (IDR), timezone (`Asia/Jakarta`), exact money (C-105), workflow states, entitlements and authorization stay as they are.

Out of scope:

- Recipient-facing auth email content beyond applying the recipient-language policy to the two existing emails (verification, password reset).
- Invoices and payments (F-14), WhatsApp sharing (F-15) and their surfaces. F-22 delivers the language-aware template rendering function that F-15 will call; the per-message selector UI belongs to F-15.
- A new landing design, new landing claims and pricing.
- Any new screen layout. Pencil frames and HTML exports for the affected screens are not available yet; every UI iteration is blocked until the Owner provides approved exports (AGENTS.md hard stop). Section 8 lists component boundaries and states only.

## 2. Relevant BR and AC IDs

| ID | How this design satisfies it |
|---|---|
| BR-L10N-001 | `en` default; precedence functions in §5.2; `user.locale` (§4), device cookie and per-gallery cookie (§5.3). |
| BR-L10N-002 | One resolved locale per request feeds `<html lang>`, next-intl and React Aria (§5.4); catalog parity test and missing-message contract (§9.4). |
| BR-L10N-003 | Superseded in part by the 2026-10-10 decisions (custom templates single-language; no description pairs). Design keeps one logical template per type/channel (BR-MSG-002). See §15 and the contradiction note in §3. |
| BR-L10N-004 | Identity names never translated; platform defaults marked by a stable key (§7.4); formatting/parsing rules keep exact values (§7.6). |
| BR-L10N-005 | Nothing released; no EN/ID backfill. Historical migrations untouched; snapshots (C-102) store a default key, never rewritten text (§7.4). |
| BR-L10N-006 | Recipient language is an explicit parameter of message rendering, never read from the dashboard locale (§7.3). |
| AC-L10N-001 | First visit `en` on every surface; switch on dashboard, auth, landing and gallery (§5, §8). |
| AC-L10N-002 | All `.copy.ts` modules, OCM-01…22, React Aria and metadata move to the catalog (§5.5, §8, §12). |
| AC-L10N-003 | Catalog parity + placeholder parity test; server and client `onError` diagnostics; no other-language fallback (§9.4). |
| AC-L10N-004 | Switch = server write + `router.refresh()`, preserving client state; per-request resolution with no global state (§5.6, §10). |
| AC-L10N-005 | Single `ResolvedLocale` → `lang`, next-intl `locale`, React Aria `en-US`/`id-ID`; formatter round-trip tests (§5.4, §7.6). |
| AC-L10N-006 | OCM coverage matrix in §12; historical migrations `0003`, `0007`, `0011` unchanged. |
| AC-L10N-007 | Superseded by Owner 2026-10-10 (no paired authoring, no readiness). AC text needs Owner amendment (§15). |
| AC-L10N-008 | Default templates render the matching code version; custom text is sent as written; placeholder contract identical across EN/ID defaults; template count unchanged (§7.1). |
| AC-L10N-009 | Superseded by "nothing is released" (spec line 23). Design still flags existing dev/staging rows without rewriting them (§4.3). AC text needs Owner amendment. |
| AC-L10N-010 | Rendering takes the recipient language as an argument; default preselection is `user.locale`; sending stays manual (C-106) (§7.3). |
| AC-L10N-011 | Copy comes from the reviewed deck; Pencil exports gate UI iterations (§8, §16). |
| AC-L10N-012 | Netlify build smoke, SSR/hydration agreement tests and one E2E journey per surface (§12). |

## 3. Decisions

| # | Decision | Source | Status |
|---|---|---|---|
| D-1 | English (`en`) is the default; supported values `en`, `id`; formatting locales `en-US`, `id-ID`. | spec l.9–11; ADR-025 | Decided |
| D-2 | Owner dashboard language is `user.locale` (`en`/`id`, default `en`, check constraint), changed on the Profile page, applied after sign-in. | spec l.19 | Decided |
| D-3 | Before sign-in (auth screens, landing): device cookie `shutrly_locale`, else `en`. A signed-in owner on those screens sees `user.locale`. | spec l.20 | Decided (signed-in case is a design reading of "applies after sign-in") |
| D-4 | Gallery precedence: client cookie for that gallery > owner's current `user.locale` > `en`, resolved per request, never snapshotted. | spec l.21 | Decided |
| D-5 | Gallery cookie is path-scoped: `shutrly_gallery_locale`, `Path=/g/<token>`, same scoping as the ADR-023 session cookie. | spec l.21 leaves it to design; ADR-023 | Decided (design) |
| D-6 | Locale resolution and message assembly live in `src/composition/locale/`; no URL locale prefix; no process-global state. | ADR-025; overview › Localization | Decided |
| D-7 | The proxy forwards a server-internal request header naming the gallery token so the request config can resolve the gallery owner's locale. | design (§5.3) | Decided (design); verify in I1 |
| D-8 | `composition/locale/message-catalog` may import `*.copy.ts` modules from `features/*/ui`, `src/ui` and `src/app`. This needs a narrow `eslint-plugin-boundaries` exception and a coding-rules amendment. | ADR-025 l.15 vs coding-rules boundary table | **Proposed — needs Owner** |
| D-9 | Copy modules hold ICU message strings as `{ en, id }` pairs under one namespace; components read them with next-intl `useTranslations`/`getTranslations`. The `local/ui-copy` lint rule is extended to accept `t("key")` from a sibling-copy namespace. | ADR-025; coding rules › Copy | Decided (design) |
| D-10 | Missing message: non-production stages throw; production logs `l10n.missing_message` and renders an empty string. Never the other language, never the key. | ADR-025 l.19 delegates the contract | Decided (design) |
| D-11 | Custom template content is single-language, sent as written. | spec l.25 | Decided |
| D-12 | Default templates: EN and ID in code; `message_template.is_default` flag; `content` nullable; a default renders in the requested language. | spec l.26 | Decided (direction); storage confirmed here |
| D-13 | Restore default stays a draft change saved with *Save* (F-03 A-4). The save sends `mode: "default"`, and the server stores `is_default = true, content = NULL`. | F-03 spec A-4; spec l.26 | Decided (design) |
| D-14 | Existing dev/staging template rows are flagged by 0019: a row is default only if its content equals the historical 0003 text byte for byte; other rows become custom. No content is rewritten. | spec l.23, l.26 | Decided (design) |
| D-15 | One domain function `resolveTemplateContent(template, language)` feeds the editor, the preview and (later) F-15 message assembly. | brief; ADR-025 | Decided (design) |
| D-16 | Recipient language is an explicit argument for every generated message; the default preselection is the owner's `user.locale`. | spec l.22, l.27; BR-L10N-006 | Decided |
| D-17 | Auth emails (verification, reset): how the owner chooses the language "per message" before sign-in. | spec l.22 | **Proposed — needs Owner** (§7.3, Q-1) |
| D-18 | Platform-default item definitions and team roles carry a nullable stable `default_key`; any rename or unit change clears it, after which the stored text is an identity. Project item snapshots copy the key. | spec l.24 leaves marking to design | **Proposed — needs Owner** (Q-2) |
| D-19 | Amount input parsing follows the active locale: its group separator is accepted, its decimal separator is a `NOT_WHOLE` error. An input is never silently reinterpreted. | ADR-025; OCM-20/21; localization policy | Decided (design) |
| D-20 | Display formats per locale for IDR amounts and dates. | ADR-025 maps locales only | **Proposed — needs Owner** (Q-3) |
| D-21 | Optimistic concurrency on template save (`expectedUpdatedAt`) with a new "changed elsewhere" state. | brief §10 | **Proposed — needs Owner** (new state and copy) |
| D-22 | Initialize `user.locale` at registration from the pre-sign-in locale the person used. | none (spec says default `en`) | **Proposed — needs Owner** (Q-4) |
| D-23 | Time fields keep the current 24-hour display in both locales; hour cycle is not inferred from language. | OCM-17; BR-L10N-004 | Decided (design) |

**Source contradictions found (report, not resolved here):**

- `spec.md` l.13 ("custom WhatsApp templates, must support both EN and ID versions") and l.83–89 conflict with l.25 and l.28–29 (single-language custom templates, no pairs, readiness closed). l.25 records the change.
- `docs/domain/business-rules.md` l.439 (BR-L10N-003 "reviewed EN/ID versions"), l.445 (BR-L10N-005 "agree migration and historical viewing policies") and `docs/product/localization.md` l.12, l.14, l.27–29 still require pairs, readiness and a legacy policy. Spec l.25 says the Owner must update them before implementation.
- `docs/coding-rules.md` l.198 ("Owner-authored descriptions/templates support both versions") and ADR-025 l.21 ("one logical template … with language versions") likewise.
- `acceptance-criteria.md` AC-L10N-007 and AC-L10N-009 test the superseded behavior.
- ADR-025 l.15 puts message assembly in composition, but the coding-rules boundary table (l.48) does not let composition import feature UI, where `*.copy.ts` lives (D-8).

## 4. Database changes

One drizzle-kit migration, `drizzle/0019_locale_preferences.sql`, generated from schema changes. The data statements in §4.3 are added to the generated file before it is reviewed and committed, and before it is first applied.

### 4.1 `user.locale`

```sql
ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;
ALTER TABLE "user" ADD CONSTRAINT "user_locale_ck" CHECK ("locale" in ('en','id'));
```

Drizzle: `locale: text("locale").notNull().default("en")` plus `check("user_locale_ck", …)` in `src/adapters/db/schema/auth/auth.ts`. Better Auth: add `locale: { type: "string", required: false, defaultValue: "en", input: false }` to `user.additionalFields` in `create-auth.ts`, so sign-up bodies cannot set it. It is written only by our use case (§6).

### 4.2 `message_template.is_default` and nullable `content`

```sql
ALTER TABLE "message_template" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;
ALTER TABLE "message_template" ALTER COLUMN "content" DROP NOT NULL;
ALTER TABLE "message_template" DROP CONSTRAINT "message_template_content_ck";
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_content_ck"
  CHECK ("content" is null or char_length("content") between 1 and 2000);
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_custom_content_ck"
  CHECK ("is_default" or "content" is not null);
-- §4.3 data statement runs here
ALTER TABLE "message_template" ALTER COLUMN "is_default" SET DEFAULT true;
```

Rules: a custom row (`is_default = false`) must hold 1–2000 characters. A default row may hold `NULL`. New code writes `NULL` for every default row and ignores `content` whenever `is_default` is true. A non-null `content` on a default row is accepted only for rows that existed before 0019, so the staging code deployed from `staging` keeps reading a non-null value (ADR-024: safe for deployed code).

### 4.3 Flagging existing dev/staging rows (no rewrite)

```sql
UPDATE "message_template" SET "is_default" = true
WHERE ("type", "content") IN (<the five (type, text) pairs from 0003_message_template_backfill.sql>);
```

A row whose text equals the historical Indonesian default byte for byte was never edited, so it becomes default. Any other row is an owner edit and stays custom, as written. Content is not changed. A unit test in `tests/config/` asserts the 0019 literals equal the 0003 literals, the same way the existing backfill tests do.

### 4.4 Platform-default keys (**Proposed — needs Owner**, D-18)

```sql
ALTER TABLE "service_item_definition" ADD COLUMN "default_key" text;
-- check: default_key is null or in ('EDITED_PHOTOS','PRINTED_PHOTOS','PEOPLE_COUNT','SHOOT_DURATION')
-- partial unique index (workspace_id, default_key) where default_key is not null
ALTER TABLE "team_role" ADD COLUMN "default_key" text;
-- check: default_key is null or in ('PHOTOGRAPHER','VIDEOGRAPHER','ASSISTANT'); same partial unique index
ALTER TABLE "project_item" ADD COLUMN "default_key" text;
-- same check as service_item_definition; no unique index (snapshot)
UPDATE "service_item_definition" SET "default_key" = … WHERE (name, unit) match the 0007 seed exactly;
UPDATE "team_role" SET "default_key" = … WHERE name matches the 0011 seed exactly;
UPDATE "project_item" SET "default_key" = … WHERE definition carries a key and (name, unit) equal the seed text;
```

`name` and `unit` stay `NOT NULL`/nullable as today and keep their stored text, so existing uniqueness indexes and older code keep working.

### 4.5 Gallery

No gallery table change. The gallery language preference is a client cookie (D-4, D-5), and the owner's locale is read via `workspace.owner_user_id → user.locale`.

### 4.6 Safety and seed

- Nothing is released (spec l.23). Production has no database while the landing gate is up (ADR-021).
- 0019 is additive. It drops only the `message_template_content_ck` constraint, which it immediately replaces with a looser one. It drops or renames no column. Older code on the shared staging database keeps working, except as noted in Risk R-3.
- Historical migrations `0003`, `0007` and `0011` and their tests are not edited (ADR-025 l.21, BR-L10N-005). Their tests compare against a frozen historical constant. `DEFAULT_TEMPLATE_CONTENT` no longer has to equal 0003 once the ID wording is revised from the deck.
- Run only through `pnpm db:migrate` against the `.dev.vars` non-production database, after the migration is generated, reviewed and committed, and report the run (ADR-024, AGENTS.md).
- Seeds change:
  - `seedDefaultTemplates` inserts `{ type, isDefault: true, content: null }`.
  - `seedDefaultItemDefinitions` and `seedDefaultTeamRoles` insert `default_key` plus `name`/`unit` text in the creating owner's `user.locale` (D-18). The text is stored because the columns are `NOT NULL` and drive uniqueness.
  - `scripts/dev/seed.ts` needs no change beyond what the use cases do. It can set the demo owner's `locale` through the new use case. Its Indonesian sample identities (*Wisuda*, client names) are data and stay.

## 5. Locale architecture

### 5.1 Types and modules

| Unit | Responsibility |
|---|---|
| `src/shared/locale/locale.ts` (+ `.types.ts`, `.test.ts`) | `AppLocale = "en" \| "id"`, `DEFAULT_LOCALE = "en"`, `parseAppLocale(raw): AppLocale \| null`, `formattingLocale(l): "en-US" \| "id-ID"`. Plain TypeScript; domain may import the types. |
| `src/composition/locale/locale-cookies/` | Names and attributes of `shutrly_locale` and `shutrly_gallery_locale`; read/write through `next/headers` `cookies()`. Mirrors `pending-email-cookie.ts`. |
| `src/composition/locale/resolve-locale/` | Pure precedence functions `resolveAccountLocale({ ownerLocale, deviceCookie })` and `resolveGalleryLocale({ clientCookie, ownerLocale })`. Fully unit-tested, no I/O. |
| `src/composition/locale/request-locale/` | `getRequestLocale()`, wrapped in React `cache()` (request-scoped). It reads the proxy header, cookies and the session, loads the owner locale, and calls the resolver. |
| `src/composition/locale/request-config/` | next-intl `getRequestConfig`: `{ locale, messages, timeZone: "Asia/Jakarta", formats, onError, getMessageFallback }`. Registered with `createNextIntlPlugin("./src/composition/locale/request-config/request-config.ts")` in `next.config.ts`. |
| `src/composition/locale/message-catalog/` | Imports every `*.copy.ts` pair (D-8), builds `{ en, id }` catalogs keyed by namespace and exposes `messagesFor(locale, surface)`. |
| `src/composition/locale/locale-flow/` | Entry points for the switch actions (§6). |
| `src/ui/providers/app-providers.tsx` | Receives `locale` and `messages`. Renders `NextIntlClientProvider` (client `onError`/`getMessageFallback` defined here, since functions can't cross the RSC boundary) and `I18nProvider locale={formattingLocale(locale)}`. |

### 5.2 Precedence

- Account surfaces (landing, auth, owner): `user.locale` when a valid owner session exists, else a valid `shutrly_locale`, else `en`.
- Gallery surface (`/g/<token>/**`): a valid `shutrly_gallery_locale`, else the gallery owner's current `user.locale`, else `en` (unknown token, or a lookup failure that is logged).
- Browser `Accept-Language` is never used (localization policy l.25).

### 5.3 Reading the request

- **Proxy (`src/proxy.ts`):** it does no locale resolution and no database access. On every request it deletes any incoming `x-shutrly-gallery-token` header. For paths matching `/g/<token>` it then sets that header on the forwarded request (`NextResponse.next({ request: { headers } })`). The landing gate and session redirect are unchanged. The header is server-internal and is never logged or echoed (C-103). A forged header can only make a request resolve some other known gallery's owner locale.
- **Server Components:** `getRequestLocale()` reads `headers()` and `cookies()` from `next/headers`. For galleries it skips the database when the client cookie is valid. Otherwise it runs one query `findOwnerLocaleByToken`, under a token-format check, which the gallery composition owns. For account surfaces it reads the session only when a session cookie is present. On a landing-only production (`isLandingOnly()`) it never touches the database.
- **Alternative considered:** a separate root layout at `src/app/(client)/g/[token]/layout.tsx` read through `next/root-params`. It needs multiple root layouts, moves `not-found.tsx` to the experimental `global-not-found.js`, and root params are not available in server actions. It was rejected for I1 and is kept as a fallback if the header spike fails.

### 5.4 One locale everywhere

`src/app/layout.tsx` awaits `getLocale()` and `getMessages()` from `next-intl/server`. Both resolve through `request-config`, which calls `getRequestLocale()`, so the whole render shares one cached value. The layout renders `<html lang={locale}>` and `<AppProviders locale={locale} messages={…}>`. Local `I18nProvider locale="id-ID"` overrides in `date-field.tsx` and `time-field.tsx` are removed (OCM-16/17). A unit test renders the layout for each locale and asserts `lang`, the next-intl locale and the React Aria locale match (AC-L10N-005). Metadata (`generateMetadata`) uses `getTranslations` for any non-brand text.

### 5.5 Copy modules and catalog

- Each `x.copy.ts` exports `X_COPY_NAMESPACE` and `X_COPY = { en: {...}, id: {...} } as const`, holding ICU strings with plurals/selects in place of function copy (e.g. OCM-13 `photoCounts` becomes one ICU message with `{proof}`, `{missing}` counts).
- `id` is typed `satisfies CopyShape<typeof X_COPY.en>`, so a missing key fails typecheck. next-intl `AppConfig.Messages` is declared from the EN catalog type for typed keys.
- Messages for the client provider are picked per surface: `landing`, `auth`, `owner`, `gallery` and `shared`. This keeps the landing payload free of owner copy. The namespace-to-surface map lives in `message-catalog`.
- Recipient content is not in the next-intl catalog. Default WhatsApp templates (`{{var}}` syntax) live in the communications domain. Auth email copy stays in `auth-email-templates.copy.ts` as an `{ en, id }` pair read by the adapter with an explicit locale.

### 5.6 Must not be global

No module-level mutable locale, no `setRequestLocale`-style singletons, no locale cached in a module `Map`. `cache()` is per request. The catalog objects are immutable constants (safe to share). Domain formatters receive the formatting locale as an argument and build `Intl` objects from a per-locale frozen lookup, never a mutable one.

## 6. Server/API interface

All actions are thin: parse, call composition, map the result (coding rules › Next.js).

| Action / handler | File | Composition entry → use case | Behavior |
|---|---|---|---|
| `setOwnerLocale(locale)` | `src/app/actions/auth/profile.ts` | `locale-flow.updateOwnerLocale` → `features/auth/application/use-cases/update-owner-locale` (port `account-directory` gains `setLocale(userId, locale)`) | Owner guard; user ID from the session only (C-004); Zod `appLocaleSchema`; writes `user.locale`. Returns `{ ok }` or a typed error; client calls `router.refresh()`. |
| `setDeviceLocale(locale)` | `src/app/actions/locale/device.ts` | `locale-flow.setDeviceLocale` | Pre-sign-in screens and landing; writes `shutrly_locale` only. Allowed on landing-only production (POST to `/`). |
| `setGalleryLocale(token, locale)` | `src/app/actions/client-access/gallery-locale.ts` | `locale-flow.setGalleryLocale` → reuses gallery token resolution (`client-access-flow`) | Validates the token format and that the token resolves to an available gallery (C-104); writes `shutrly_gallery_locale` with `Path=/g/<token>`. Needs no gallery password, because the locked password screen also switches language. Rate-limited by the existing unknown-token limiter (ADR-023). |
| `saveMessageTemplate(rawId, slug, input)` (changed) | `src/app/actions/communications/…` | `message-template-flow.saveMessageTemplate` → `update-message-template` | Input `{ mode: "custom", content } \| { mode: "default" }` (D-13). Optionally `expectedUpdatedAt` (D-21, Proposed). |
| `loadMessageTemplateEditor` (changed) | composition only | `get-message-template` + `resolveTemplateContent(record, ownerLocale)` | Returns `{ type, isDefault, content (resolved), defaultContent (owner locale), brandName, updatedAt }`. |
| Auth email triggers (changed) | register, resend, forgot-password actions | register/recovery flows → `auth-email` port gains `locale` | Recipient language passed explicitly (D-17, Proposed). |

Recipient language for F-15 is not an F-22 action. F-22 exposes `renderTemplateForRecipient(template, language, values)` in the communications application layer for F-15 to call.

## 7. Domain and application logic

### 7.1 Default templates

- `DEFAULT_TEMPLATE_CONTENT: Readonly<Record<AppLocale, Readonly<Record<TemplateType, string>>>>` in `features/communications/domain/default-templates/`. Wording comes from deck §11.4.
- `resolveTemplateContent({ isDefault, content, type }, language): string` (domain, pure). If `isDefault`, it returns `DEFAULT_TEMPLATE_CONTENT[language][type]`. Otherwise it returns `content`, asserting non-null (a violated invariant is a bug, not a recoverable error).
- Editor and preview call it with the owner's `user.locale`. F-15 calls it with the owner-chosen recipient language (D-16), then `renderTemplate` as today.
- Invariants (unit tests): both languages define all five types; each EN/ID default passes `findTemplateProblem` for its type; and each pair has the same placeholder set (BR-MSG-004/006). The logical template count stays five per workspace (BR-MSG-002).

### 7.2 Save and restore default

- `mode: "custom"`: validate 1–2000 characters plus required variables (existing schema), normalise, then store `is_default = false, content = text, updated_by, updated_at`.
- `mode: "default"`: store `is_default = true, content = NULL, updated_by, updated_at`, ignoring any content sent.
- Editor: *Restore default* puts `defaultContent` into the field and marks the draft `restored`. The draft is saved as `mode: "default"` while its text still equals `defaultContent`. Any edit after that switches the draft to `mode: "custom"`. Leaving without saving keeps the stored state (A-4).
- The server never infers default status by comparing text, except in the one-time 0019 flagging. An owner who deliberately saves the ID wording while browsing in EN keeps a custom template.

### 7.3 Recipient language

- Generated messages (F-15): `language` is a required argument. The composition entry point preselects `user.locale` for the UI and never reads the request locale. A custom template ignores `language` for its text, which is sent as written. `language` still formats the values (`invoiceTotal`, dates) of that message (§7.6).
- Auth emails (D-17, **Proposed — needs Owner**). The verification and reset emails go to the owner, usually before sign-in, so there is no dashboard. Proposal: each auth form that triggers an email submits an explicit `emailLocale`, preselected to the screen's resolved locale. For a signed-in owner (none of the current flows) it is preselected to `user.locale`. `AuthEmailPort.send({ kind, to, link, locale })` and `auth-email-templates` select the `{ en, id }` copy by `locale`. Better Auth's `sendVerificationEmail`/`sendResetPassword` callbacks receive only `user`/`token`, so the chosen locale has to reach them through a request-scoped value set by the flow, or through `user.locale` when the email follows a sign-in. The mechanism is confirmed in the iteration spike.

### 7.4 Identity vs platform default (D-18, **Proposed — needs Owner**)

- Identities, never translated: service, category, item-definition and unit text without a key; booking field definitions; project titles; project items without a key; sessions; team members; roles without a key; clients; workspaces; brand names; gallery source labels; folder names; add-on descriptions.
- Platform defaults: a row whose `default_key` is non-null displays the catalog label for that key in the screen's locale, e.g. `EDITED_PHOTOS` → *Edited photos* / *Foto edit*, unit *photos* / *foto* (deck §5.7). Roles: *Photographer/Fotografer*, *Videographer/Videografer*, *Assistant/Asisten*.
- Rename rule: an update that changes `name` (or `unit` for items) sets `default_key = NULL` in the same statement. From then on the stored text is an identity, shown as written. There is no restore-default for items or roles; that is not specified.
- Uniqueness: the existing `lower(name)` index stays. The application also refuses a new or renamed name that equals, ignoring case, either locale's label of a keyed row in the same workspace. That error reuses the existing duplicate-name message.
- Snapshots (C-102): project creation copies `default_key` with `name`/`unit` into `project_item`. Owner and gallery screens render keyed snapshot items in their own locale. The snapshot never changes when the definition is later renamed.

### 7.5 Owner-authored text

Add-on description: one owner-only text (1–100 characters), no pairs, shown as written. Services and categories have no description column. Nothing to build.

### 7.6 Formatting and parsing

- Domain formatters take `FormattingLocale` as a parameter: `idr-amount`, `package-value.formatQuantity`, `session`, `gallery-display`, and the template character-limit number (OCM-18…22). Money stays a digit string formatted through `BigInt` (ADR-007). Time zones stay explicit: `Asia/Jakarta` for galleries and schedules, `UTC` for session dates as today.
- `parseIdrAmount(raw, locale)`: strips an optional `Rp`/`IDR` prefix and spaces, and removes the locale's group separator (`id`: `.`, `en`: `,`). The other separator is then a `NOT_WHOLE` problem. Round-trip law: `parse(format(v, l), l) === v` for both locales and boundary values 0, 1, 999, 1 000, 1 500 000, `IDR_MAX`.
- `parseQuantity(raw, locale)` accepts only that locale's decimal separator and no grouping. The same round-trip law holds, keeping the existing package scale and limits.
- The server parses with the server-resolved locale, never a client-supplied one (C-004).
- On a language switch, amount and quantity inputs that parse under the previous locale are rewritten in the new locale's format; text that doesn't parse is kept as typed (AC-L10N-004).
- Display patterns per locale (currency symbol and spacing, date style) are D-20 (Q-3). Until decided, I3 implements the parser and round-trip laws behind formatter functions whose output pattern is a single constant per locale.

## 8. UI components and states

Owner decision (2026-10-10): this feature changes copy, not design. Pencil exports are not required for copy-only changes, so I4–I8 do not wait for exports. Any layout change still needs its own review.

No layout is designed here. Each item needs approved Pencil exports before implementation.

| Component (unit folder) | States (C-007) |
|---|---|
| `src/ui/patterns/language-switch/` (React Aria `RadioGroup` or `Select`; the type follows the Pencil design) | idle, pending (*Changing language…*), failed with retry (*Couldn't change the language…*), disabled while pending; accessible name *Language/Bahasa*; options use self-names (deck §1). |
| `features/auth/ui/profile-language-field/` (Profile page) | loading from server data, idle, pending, saved (toast if Pencil has one), error + retry. |
| `features/auth/ui/auth-language-switch/` (auth layout) and the landing placement | idle, pending, failed; works without a session. |
| `features/gallery/ui/client-language-switch/` (client shell and password gate) | idle, pending, failed; must not clear selections, the pick note draft or the password field. |
| `features/communications/ui/template-editor-screen`, `use-template-form` | default vs customized (needs Pencil state if shown), restored-draft, saving, saved, validation error, server error + retry, conflict (D-21, Proposed). |
| Every screen in OCM-01…09, catalog/clients/projects/team/sources/gallery/add-on screens | existing states, each in both languages; skeleton text equals final-state text (OCM-03/06). |
| `src/ui/primitives/icon-button` badge (OCM-09) | count announced through an ICU plural (`{count, plural, …}`). |
| Message preview | same locale and format policy as its page (deck §11.2). |
| Auth email locale control (D-17, if approved) | preselected value, change, submit. |

## 9. Validation and error handling

1. **Locale values:** `appLocaleSchema = z.enum(["en","id"])` at every action boundary. The database check `user_locale_ck` is the last line of defence.
2. **Cookies:** a cookie value outside `en`/`id` (tampered, stale, empty) is ignored as if absent, and is overwritten on the next explicit switch. Cookies are not signed. They hold a non-sensitive display preference, and tampering only changes the tamperer's own display.
3. **Template content:** 1–2000 characters plus required variables in custom mode (`messageTemplateContentSchema`, unchanged). In default mode no content is accepted. Database checks enforce §4.2. The character-limit message formats `2000` with the active locale (OCM-22).
4. **Missing messages (AC-L10N-003):**
   - Completeness test: every namespace has the same key set in `en` and `id`, with no empty strings. The same ICU argument names, and the same plural/select argument set, appear in both, checked with `@formatjs/icu-messageformat-parser` (already a next-intl dependency; pin it if imported directly). Default templates and auth email pairs are checked the same way.
   - Runtime, server and client: `onError` logs `l10n.missing_message` with `{ locale, namespace, key }` and no user data. In every stage except `APP_STAGE=production` it throws, so dev, test, E2E and staging fail loudly. `getMessageFallback` returns `""`, never the key and never the other language.
   - Other next-intl errors (`FORMATTING_ERROR`, `INVALID_MESSAGE`) follow the same path.
5. **Domain errors:** domain error codes stay stable. UI maps them through catalog keys (OCM-07/08 become key maps, keeping the stable keys from §E of the audit).

## 10. Concurrency and consistency

- Locale is resolved per request through `cache()`. Nothing is stored in module scope. An integration test fires interleaved requests with different cookies and sessions and asserts each response's `lang` (AC-L10N-004).
- The gallery reads the owner locale on each request (D-4), so an owner switch applies to non-choosing clients on their next request. No snapshot exists to go stale.
- Workspace switching does not change the locale (it is per user). Different owners' galleries never share a cookie, because of the path scope.
- The switch performs a server write, then `router.refresh()`. React client state, React Hook Form values and selection state survive. The E2E test asserts route, selections and unsaved values are preserved.
- Template edit vs restore vs a second tab: today last write wins. D-21 (**Proposed**): the save carries `expectedUpdatedAt`, and the repository updates `WHERE updated_at = $expected`. Zero rows means a `CONFLICT` result, shown as the conflict state with reload. Without approval, behavior stays last-write-wins.
- `default_key` clearing happens in the same `UPDATE` as the rename, with no read-then-write window.

## 11. Security

- `user.locale` is written only by the signed-in owner for their own row. The user ID comes from the session (owner guard), never from input (C-004). It is not tenant data, so there is no `workspace_id` (ADR-003); no cross-workspace path exists.
- Cookie attributes for both cookies: `HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`.
  - `shutrly_locale`: `Path=/`.
  - `shutrly_gallery_locale`: `Path=/g/<token>`, so it is sent only for that gallery (D-5). Link rotation changes the path, and the client falls back to the owner locale.
- No token or locale goes into a query string (privacy rule). No locale URL rewrite (ADR-025).
- The forwarded token header (D-7) is stripped from incoming requests, never logged, and never returned. The `Cache-Control: private, no-store` header on `/g/*` stays.
- The gallery locale action and lookup authorize only through the token (C-104) and reveal nothing beyond the language. Unknown tokens count toward the ADR-023 limit.
- Logs never contain cookies, tokens or message content (C-103).

## 12. Testing strategy

Only related tests run per slice (CLAUDE.md). The Vitest integration suite uses the shared non-production database with per-test owners and workspaces.

| AC | Unit (Vitest, co-located) | Integration (`tests/integration/`) | E2E (Playwright, `tests/e2e/`) |
|---|---|---|---|
| AC-L10N-001 | `resolve-locale` precedence tables (account and gallery, invalid cookies) | session + cookie + DB resolution | first visit EN on landing, login, dashboard, gallery; switch on each |
| AC-L10N-002 | catalog key coverage per namespace; OCM-01…09 render tests in both locales | — | one journey per surface in ID (owner create project; client pick and submit) |
| AC-L10N-003 | completeness and placeholder-parity test; `onError` throws outside production | — | none |
| AC-L10N-004 | amount/quantity reformat on locale change | interleaved requests with different locales | switch mid-form and mid-selection keeps values; workspace switch keeps locale |
| AC-L10N-005 | layout renders matching `lang`/next-intl/React Aria; format/parse round trips (both separators, boundaries, `IDR_MAX`) | — | `html[lang]` before and after switch; React Aria date field labels |
| AC-L10N-006 | OCM matrix: one test per OCM ID (labels, skeletons, error maps, badge, gallery counts, formatters) | 0019 applies; the 0003/0007/0011 tests still pass against frozen constants | — |
| AC-L10N-007 / 009 | superseded (§15) | default-row flagging in 0019 leaves content unchanged | — |
| AC-L10N-008 | `resolveTemplateContent`; EN/ID default validity and placeholder parity | save custom/default modes; check constraints reject a custom row with NULL content; count stays five | edit, restore, save in EN then view in ID |
| AC-L10N-010 | `renderTemplateForRecipient` ignores request locale; auth email copy selection | auth email capture (`capturing-email-sender`) asserts the chosen locale | — |
| AC-L10N-011 | — | — | visual comparison against Pencil exports, desktop and mobile, both locales |
| AC-L10N-012 | — | — | Netlify-equivalent `next build` + start smoke; hydration warnings fail the test |

BR tests: BR-L10N-004 (identity names unchanged across switch; a keyed item renamed becomes an identity), BR-L10N-006 (dashboard locale never reaches recipient rendering), C-101 (an owner can't set another user's locale), C-102 (a renamed definition leaves snapshot items unchanged).

## 13. Copy deck corrections required

1. **§13 Bilingual authoring:** replace it. Services and categories have no description column, custom templates are single-language (spec l.25, l.28), and readiness is closed (l.29). Remove the description fields, the EN/ID message fields and all readiness/draft copy. Keep only what Pencil shows for default vs customized template state, worded by the Owner.
2. **§11.2:** the note "Restore-default copy does not decide whether the control resets one language or both" is resolved. Restore returns the template to default, which renders in the owner's language.
3. **§11.4:** "Recipient language must be selected explicitly under the final recipient policy" → per message, preselected to `user.locale` (D-16).
4. **§12 Auth emails:** "recipient locale policy is pending" → per D-17 once decided.
5. **§1 Language switch:** "Placement and persistence need design" → persistence decided (D-2…D-5); placement comes from Pencil.
6. **§5.7 and §8 (default roles):** state that EN/ID labels apply only while the row is still a platform default (D-18). Add the EN/ID role labels if missing.
7. **Reading notes (l.16) and §18 item 3 (l.1917):** remove "persistence, readiness and historical-data decisions remain open".
8. **§19 landing:** done; no change.

## 14. Risks

| ID | Risk | Mitigation |
|---|---|---|
| R-1 | The proxy-header approach (D-7) may not reach `getRequestConfig` in every render path (RSC, server actions, Netlify runtime). | I1 spike with E2E on `next build`; fallback is the root-layout restructure (§5.3). |
| R-2 | Reading cookies and session in the root layout makes every page dynamic, including landing. That adds CPU per request (ADR-018 budget) and a session lookup. | Skip the database on landing-only production and when no session cookie exists; share the cached session with the owner guard; measure in the I1 CPU check. |
| R-3 | Shared staging database (ADR-024): older code deployed on staging, editing a template after 0019, keeps `is_default = true`, so new code ignores that edit. | Apply 0019 right before deploying the branch to staging (Owner-coordinated); report it. |
| R-4 | Converting about 118 copy modules and function-valued copy to ICU strings is broad and can change meaning. | Convert by surface per iteration; render tests per OCM; the deck is the wording source. |
| R-5 | Locale-aware amount parsing can surprise users who type the other convention. | Ambiguity is a validation error, never a silent value change (D-19); round-trip tests. |
| R-6 | Client payload grows with the messages. | Per-surface message picking (§5.5). |
| R-7 | Better Auth email callbacks lack a locale argument (D-17). | Spike; request-scoped value or `user.locale`. |
| R-8 | `default_key` (D-18) touches catalog, team and project snapshot code paths. | Isolated iteration with integration tests; can be dropped if the Owner rejects D-18, in which case defaults stay seed-time text. |
| R-9 | Pencil exports are missing for every affected screen. | UI iterations blocked; non-UI iterations (I1–I4) proceed. |

## 15. Open questions for the Owner

- **Q-1 (D-17):** How does the owner choose the auth email language per message before sign-in? The proposal is an explicit control on the triggering form, preselected to the screen language. The alternative is to treat the screen language itself as that choice.
- **Q-2 (D-18):** Do you approve `default_key` for item definitions, roles and project-item snapshots? The rule would be: a rename clears it, a keyed row shows its label in the reader's language, and snapshots keep the key.
- **Q-3 (D-20):** Display patterns: IDR in English (`Rp 750,000` or `IDR 750,000`) and date style per locale (e.g. `Oct 10, 2026` / `10 Okt 2026`)?
- **Q-4 (D-22):** Should registration copy the locale the person used before sign-in into `user.locale`, or always start at `en` as spec l.19 says? Should a Profile switch also update the device cookie, so the signed-out screens follow it?
- **Q-5 (D-21):** Add a "changed elsewhere" conflict state to the template editor, or keep last-write-wins?
- **Q-6:** Please amend BR-L10N-003/005, localization policy l.12/14/27–29, coding-rules l.198, ADR-025 l.21 and AC-L10N-007/009 to match the 2026-10-10 decisions, and approve the boundary exception (D-8).

## 16. Iteration outline

| # | Iteration | AC / BR | Pencil exports |
|---|---|---|---|
| I1 | Locale foundation: install and pin next-intl; `shared/locale`; `composition/locale` (request locale, request config, catalog skeleton, cookies); proxy header; root layout `lang` and providers; missing-message contract; completeness test harness; lint rule update | AC-001 (resolution), 003, 004, 005; BR-L10N-001, 002 | No |
| I2 | Migration 0019 and preferences: `user.locale` with the Better Auth field, `message_template.is_default`, `default_key` (if Q-2 approved); owner, device and gallery locale actions and use cases | AC-001, 004; BR-L10N-001; C-101, C-104 | No (backend only) |
| I3 | Formatting and parsing: locale-parameterised formatters and parsers (OCM-14…22), round-trip tests, React Aria local overrides removed | AC-005, 006; BR-L10N-004; C-105 | No |
| I4 | Platform defaults: EN/ID default templates, `resolveTemplateContent`, save modes, seeds, keyed items and roles plus snapshots, backfill-test freeze, recipient rendering function | AC-006, 008, 010; BR-L10N-004, 006; C-102 | Yes for any editor state change |
| I5 | Shared UI, shell, auth, landing, profile copy plus language switches (auth, landing, profile); auth email locale (Q-1) | AC-001, 002, 010, 011; BR-L10N-002, 006 | Yes |
| I6 | Owner feature copy: catalog, clients, projects, team, sources, add-ons, templates (OCM-01…13) | AC-002, 006, 011; BR-L10N-002, 004 | Yes |
| I7 | Client gallery copy and client switch (password gate, home, photos, picks, review, final) | AC-001, 002, 004, 011; C-104 | Yes |
| I8 | Verification: E2E journeys per surface in both locales, Netlify build smoke, SSR/hydration checks, coverage report with remaining gaps | AC-011, 012 | Yes (comparison) |
