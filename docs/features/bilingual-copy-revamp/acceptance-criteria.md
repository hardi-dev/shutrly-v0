# Bilingual copy revamp — acceptance criteria

Status: Scope specified; persistence, recipient-language and legacy rollout cases need final behavior before a build plan.

| ID | Required behavior / evidence |
|---|---|
| AC-L10N-001 | First visits default to English on dashboard and client galleries; both expose an accessible English/Indonesian switch. Test the approved persistence/precedence policy once specified. |
| AC-L10N-002 | Every supported state and surface uses matching system copy: navigation, forms, validation, errors, loading, dialogs, portals, notifications, metadata and accessible/library-generated text. Review desktop and mobile in both languages. |
| AC-L10N-003 | Missing EN/ID messages fail completeness gates. Server/client missing-message behavior never substitutes the other language and produces actionable diagnostics. |
| AC-L10N-004 | Switching preserves route, authorization, selections and unsaved values. Concurrent requests and workspace switches do not leak locale/content between visitors. |
| AC-L10N-005 | HTML language, next-intl, React Aria and presentation formatters agree. Date/amount round trips preserve exact values, IDR currency and existing timezone; tests cover decimal/group separators. |
| AC-L10N-006 | All OCM-01–22 findings are covered, including seeded defaults, error mappings, skeletons, options and localized string anchors. Historical migrations remain unchanged. |
| AC-L10N-007 | Owner-authored descriptions/templates have clearly labeled EN/ID authoring and readiness. Incomplete translations are not exposed as bilingual-ready; no automatic translation or additional service publication lifecycle is introduced. Verify finalized save/edit behavior. |
| AC-L10N-008 | Authored content selects the matching reviewed version, preserves identity values and template placeholders, and retains existing logical template counts. |
| AC-L10N-009 | Existing records/customizations and immutable snapshots follow an approved migration/viewing policy without overwrite or relabeling. This criterion cannot pass until that policy is decided. |
| AC-L10N-010 | Emails and WhatsApp output follow the approved recipient-language policy and reset scope. Dashboard locale alone does not imply recipient locale. Sending remains manual. |
| AC-L10N-011 | Reviewed EN/ID copy has equivalent meaning and accurate recovery/consequence claims; agreed glossary terms are consistent. Updated approved Pencil exports support readable desktop/mobile text and keyboard accessibility. |
| AC-L10N-012 | Integration checks cover the configured deployment build, SSR/client agreement and critical bilingual journeys. The report distinguishes implemented coverage from future feature surfaces and records remaining gaps. |

Traceability: [BR-L10N-*](../../domain/business-rules.md), [policy](../../product/localization.md), [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md), [spec](spec.md), [audit](copy-outside-modules-audit.md). No criteria are marked passed by this documentation change.
