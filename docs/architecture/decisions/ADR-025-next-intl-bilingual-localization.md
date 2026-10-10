# ADR-025: next-intl for English and Indonesian localization

Status: Accepted — library and boundaries; implementation pending
Date: 2026-10-06
Owner: approval to proceed and align documentation, 2026-10-06

## Context

The Owner approved English by default, an EN/ID switch on dashboard and client galleries, complete localization and no cross-language fallback. This supersedes the language default/fallback in ADR-010 and the Indonesian-only MVP rule. The app uses Next.js App Router and React Aria. Strings also occur outside copy modules, persisted defaults, formatting and message templates; installing a library alone will not complete localization.

## Decision

Use **next-intl** for system messages, interpolation, pluralization and locale-aware presentation in Server and Client Components. Keep React Aria for accessible interaction and its generated UI labels. Both providers and the HTML language attribute must follow the same resolved language. Map `en`/`id` to explicit formatting locales (`en-US`/`id-ID`); business currency and timezone remain unchanged.

Preserve the fixed folder architecture. Own request configuration and message assembly in the composition layer with a custom plugin configuration path. Keep feature-owned EN/ID messages co-located in sibling `*.copy.ts` modules; do not introduce a competing top-level message ownership tree. Framework translation APIs belong in composition/UI/adapters, never domain units. Domain error codes remain stable; presentation translates them.

Resolve locale per request and synchronize the client provider. Never use mutable process-global language state or leak preferences between requests/workspaces. No locale URL rewrite, token change, cookie persistence policy or database schema is approved by this ADR; those choices belong to the pending product decisions and technical design.

Do not merge the other language's catalog as fallback. Require catalog parity and supported-state coverage before release. Configure and test missing-message handling on both server and client: next-intl defaults can expose message keys and do not enforce our completeness rule. Runtime recovery must remain in the active language and must not conceal missing translations from diagnostics. Define that recovery contract in technical design.

Owner-authored text is single-language as written (Owner, 2026-10-10). Default message templates have EN and ID versions in code. Keep one logical template per type/channel; business counts are unchanged. Nothing is released, so no legacy migration is needed. Never rewrite historical SQL migrations to change seeded copy.

## Alternatives considered

- **next-i18next / i18next:** a viable ecosystem with current App Router support. It offers broader framework reuse; this project favors next-intl's focused Next.js integration.
- **Lingui:** supports React Server Components and extraction workflows. Its macro/compiler setup adds tooling beyond the current copy-module workflow.
- **Custom context/dictionaries:** fewer dependencies, but the project would own server/client integration, formatting, pluralization and diagnostics.

## Evidence and validation limits

Official sources checked 2026-10-06: [App Router setup](https://next-intl.dev/docs/getting-started/app-router), [configuration and error handling](https://next-intl.dev/docs/usage/configuration), [release history](https://github.com/amannn/next-intl/releases), [package metadata](https://raw.githubusercontent.com/amannn/next-intl/main/packages/next-intl/package.json), [next-i18next](https://github.com/i18next/next-i18next), and [Lingui RSC guide](https://lingui.dev/tutorials/react-rsc).

The researched next-intl release is 4.14.9. Metadata declares Next.js 16 and React 19 peer compatibility; this is declared compatibility, not an integration result. Choose and pin a verified version when implementing. The package is not installed by this documentation change. Download counts indicate adoption, not unique deployments or a stability guarantee.

## Consequences and gates

- A single supported library covers server/client system translation without changing domain ownership.
- All audited strings, React Aria overrides, formatting/parsing, defaults and authored content still require explicit implementation.
- Before code, settle product gaps, update approved Pencil frames/exports, read the installed Next.js guides and write technical design plus a task-by-task plan.
- Verify SSR/client agreement, switching without lost state, missing-message behavior, concurrent locale isolation, accessible labels, safe amount/date round trips and the configured deployment build. Do not claim production compatibility until those checks pass.

## Related

- [Localization policy](../../product/localization.md)
- [Feature spec](../../features/bilingual-copy-revamp/spec.md)
- [ADR-010](ADR-010-tailwind-react-aria.md): UI stack retained; language default/fallback superseded
- Constitution C-007, C-008, C-011, C-102, C-105, C-106
