# Copy inventory

Snapshot: 2026-10-06, staging base `bdab2c2`.

96 existing `.copy.ts` files. This is a starting inventory, not proof of complete string coverage. Audit must also inspect validation schemas, server error mapping, metadata, accessibility text, date/number formatting, emails and generated messages. Internal/demo files are reviewed separately from shipped product copy.

### Added 2026-10-10 (client gallery and add-on coverage)

| File | Surface |
|---|---|
| `src/features/gallery/ui/client-gate-screen/client-gate-screen.copy.ts` | Product — client gallery access |
| `src/features/gallery/ui/client-password-form/client-password-form.copy.ts` | Product — client gallery password |
| `src/features/gallery/ui/client-unavailable/client-unavailable.copy.ts` | Product — unavailable client gallery |
| `src/features/gallery/ui/client-home-screen/client-home-screen.copy.ts` | Product — client gallery home |
| `src/features/gallery/ui/client-browse-screen/client-browse-screen.copy.ts` | Product — client photo browse and download |
| `src/features/gallery/ui/client-copy/client-copy.copy.ts` | Product — shared client gallery labels and statuses |
| `src/features/gallery/ui/pick-screen/pick-screen.copy.ts` | Product — client selection group |
| `src/features/gallery/ui/pick-note-sheet/pick-note-sheet.copy.ts` | Product — client photo notes |
| `src/features/gallery/ui/review-screen/review-screen.copy.ts` | Product — client selection review and submit |
| `src/features/gallery/ui/viewer-pick-actions/viewer-pick-actions.copy.ts` | Product — client viewer selection actions |
| `src/features/gallery/ui/gallery-summary-text/gallery-summary.copy.ts` | Product — owner gallery summaries |
| `src/features/gallery/ui/selection-owner-text/selection-owner.copy.ts` | Product — owner selection review |
| `src/features/gallery/ui/delivery-screen/delivery-screen.copy.ts` | Product — client final delivery |
| `src/features/gallery/ui/delivery-copy/delivery.copy.ts` | Product — owner final delivery |
| `src/features/gallery/ui/project-access-card/project-access-card.copy.ts` | Product — owner client access |
| `src/features/booking/ui/add-on-copy/add-on.copy.ts` | Product — owner add-ons |
| `src/app/not-found.copy.ts` | Product — global not-found |
| `src/ui/primitives/stepper/stepper.copy.ts` | Product — stepper accessible actions |

| File | Surface |
|---|---|
| `src/adapters/email/auth-email-templates/auth-email-templates.copy.ts` | Product |
| `src/app/(owner)/profile/layout.copy.ts` | Product |
| `src/app/(owner)/w/[workspaceId]/layout.copy.ts` | Product |
| `src/app/error.copy.ts` | Product |
| `src/app/page.copy.ts` | Product |
| `src/features/auth/ui/account-sections/account-sections.copy.ts` | Product |
| `src/features/auth/ui/account-unavailable-screen/account-unavailable-screen.copy.ts` | Product |
| `src/features/auth/ui/auth-error-alert/auth-error-alert.copy.ts` | Product |
| `src/features/auth/ui/change-password-form/change-password-form.copy.ts` | Product |
| `src/features/auth/ui/controlled-text-field/controlled-text-field.copy.ts` | Product |
| `src/features/auth/ui/forgot-password-form/forgot-password-form.copy.ts` | Product |
| `src/features/auth/ui/forgot-password-screen/forgot-password-screen.copy.ts` | Product |
| `src/features/auth/ui/google-button/google-button.copy.ts` | Product |
| `src/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.copy.ts` | Product |
| `src/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.copy.ts` | Product |
| `src/features/auth/ui/login-form/login-form.copy.ts` | Product |
| `src/features/auth/ui/login-screen/login-screen.copy.ts` | Product |
| `src/features/auth/ui/profile-form/profile-form.copy.ts` | Product |
| `src/features/auth/ui/register-form/register-form.copy.ts` | Product |
| `src/features/auth/ui/register-screen/register-screen.copy.ts` | Product |
| `src/features/auth/ui/resend-verification/resend-verification.copy.ts` | Product |
| `src/features/auth/ui/reset-password-form/reset-password-form.copy.ts` | Product |
| `src/features/auth/ui/reset-password-screen/reset-password-screen.copy.ts` | Product |
| `src/features/auth/ui/reset-sent-screen/reset-sent-screen.copy.ts` | Product |
| `src/features/auth/ui/verify-pending-screen/verify-pending-screen.copy.ts` | Product |
| `src/features/booking/ui/catalog-copy/catalog-copy.copy.ts` | Product |
| `src/features/booking/ui/client-copy/client-copy.copy.ts` | Product |
| `src/features/booking/ui/project-copy/project-copy.copy.ts` | Product |
| `src/features/booking/ui/team-copy/team-copy.copy.ts` | Product |
| `src/features/communications/ui/message-preview/message-preview.copy.ts` | Product |
| `src/features/communications/ui/template-copy/template-copy.copy.ts` | Product |
| `src/features/communications/ui/template-editor-screen/template-editor-screen.copy.ts` | Product |
| `src/features/communications/ui/template-list-skeleton/template-list-skeleton.copy.ts` | Product |
| `src/features/communications/ui/template-problem-text/template-problem-text.copy.ts` | Product |
| `src/features/communications/ui/unsaved-changes-dialog/unsaved-changes-dialog.copy.ts` | Product |
| `src/features/communications/ui/variable-chip/variable-chip.copy.ts` | Product |
| `src/features/gallery/ui/gallery-copy/gallery-copy.copy.ts` | Product |
| `src/features/gallery/ui/source-copy/source-copy.copy.ts` | Product |
| `src/features/workspace/ui/coming-soon-screen/coming-soon-screen.copy.ts` | Product |
| `src/features/workspace/ui/create-workspace-dialog/create-workspace-dialog.copy.ts` | Product |
| `src/features/workspace/ui/dashboard-screen/dashboard-screen.copy.ts` | Product |
| `src/features/workspace/ui/onboarding-screen/onboarding-screen.copy.ts` | Product |
| `src/features/workspace/ui/owner-nav/owner-nav.copy.ts` | Product |
| `src/features/workspace/ui/owner-shell/owner-shell.copy.ts` | Product |
| `src/features/workspace/ui/settings-screen/settings-screen.copy.ts` | Product |
| `src/features/workspace/ui/workspace-field-error/workspace-field-error.copy.ts` | Product |
| `src/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy.ts` | Product |
| `src/features/workspace/ui/workspace-switcher/workspace-switcher.copy.ts` | Product |
| `src/ui/explorer/tokens/token-explorer.copy.ts` | Internal/demo |
| `src/ui/patterns/alert/alert.copy.ts` | Product |
| `src/ui/patterns/app-panel/app-panel.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/app-shell/app-shell.copy.ts` | Product |
| `src/ui/patterns/app-shell/app-shell.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/bottom-nav/bottom-nav.copy.ts` | Product |
| `src/ui/patterns/bottom-sheet/bottom-sheet.copy.ts` | Product |
| `src/ui/patterns/combobox/combobox.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/compact-bar/compact-bar.copy.ts` | Product |
| `src/ui/patterns/data-table/data-table.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/date-field/date-field.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/editorial-panel/editorial-panel.copy.ts` | Product |
| `src/ui/patterns/empty-state/empty-state.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/folder-tile/folder-tile.copy.ts` | Product |
| `src/ui/patterns/folder-tile/folder-tile.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/list-card-item/list-card-item.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/media-viewer/media-viewer.copy.ts` | Product |
| `src/ui/patterns/media-viewer/media-viewer.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/menu/menu.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/mobile-app-shell/mobile-app-shell.copy.ts` | Product |
| `src/ui/patterns/mobile-shell/mobile-shell.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/modal/modal.copy.ts` | Product |
| `src/ui/patterns/multi-select/multi-select.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/option-card/option-card-group.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/page-header/page-header.copy.ts` | Product |
| `src/ui/patterns/photo-tile/photo-tile.copy.ts` | Product |
| `src/ui/patterns/photo-tile/photo-tile.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/section-card/section-card.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/segmented-control/segmented-control.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/select/select.copy.ts` | Product |
| `src/ui/patterns/select/select.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/sidebar/sidebar.copy.ts` | Product |
| `src/ui/patterns/sidebar/sidebar.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/split-layout/split-layout.copy.ts` | Product |
| `src/ui/patterns/tabs/tabs.stories.copy.ts` | Internal/demo |
| `src/ui/patterns/toast/toast.copy.ts` | Product |
| `src/ui/patterns/toast/toast.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/avatar/avatar.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/button/button.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/checkbox/checkbox.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/input/input.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/status-chip/status-chip.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/switch/switch.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/text-field/text-field.copy.ts` | Product |
| `src/ui/primitives/text-field/text-field.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/textarea/textarea.copy.ts` | Product |
| `src/ui/primitives/time-field/time-field.stories.copy.ts` | Internal/demo |
| `src/ui/primitives/tooltip/tooltip.copy.ts` | Product |

## Outside-copy-module audit

See [copy-outside-modules-audit.md](copy-outside-modules-audit.md): 22 source files requiring direct-copy, persisted-default, string-composition or locale review, plus three historical SQL backfill duplicates. Static review only; application copy remains unchanged.
