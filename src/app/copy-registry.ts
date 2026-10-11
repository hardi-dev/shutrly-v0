import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";
import { ACCOUNT_SECTIONS_COPY } from "@/features/auth/ui/account-sections/account-sections.copy";
import { ACCOUNT_UNAVAILABLE_SCREEN_COPY } from "@/features/auth/ui/account-unavailable-screen/account-unavailable-screen.copy";
import { AUTH_ERROR_COPY } from "@/features/auth/ui/auth-error-alert/auth-error-alert.copy";
import { CHANGE_PASSWORD_FORM_COPY } from "@/features/auth/ui/change-password-form/change-password-form.copy";
import { CONTROLLED_TEXT_FIELD_COPY } from "@/features/auth/ui/controlled-text-field/controlled-text-field.copy";
import { FORGOT_PASSWORD_FORM_COPY } from "@/features/auth/ui/forgot-password-form/forgot-password-form.copy";
import { FORGOT_PASSWORD_SCREEN_COPY } from "@/features/auth/ui/forgot-password-screen/forgot-password-screen.copy";
import { GOOGLE_BUTTON_COPY } from "@/features/auth/ui/google-button/google-button.copy";
import { INVALID_RESET_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.copy";
import { INVALID_VERIFY_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.copy";
import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { LOGIN_SCREEN_COPY } from "@/features/auth/ui/login-screen/login-screen.copy";
import { PROFILE_FORM_COPY } from "@/features/auth/ui/profile-form/profile-form.copy";
import { REGISTER_FORM_COPY } from "@/features/auth/ui/register-form/register-form.copy";
import { REGISTER_SCREEN_COPY } from "@/features/auth/ui/register-screen/register-screen.copy";
import { RESEND_VERIFICATION_COPY } from "@/features/auth/ui/resend-verification/resend-verification.copy";
import { RESET_PASSWORD_FORM_COPY } from "@/features/auth/ui/reset-password-form/reset-password-form.copy";
import { RESET_PASSWORD_SCREEN_COPY } from "@/features/auth/ui/reset-password-screen/reset-password-screen.copy";
import { RESET_SENT_SCREEN_COPY } from "@/features/auth/ui/reset-sent-screen/reset-sent-screen.copy";
import { VERIFY_PENDING_SCREEN_COPY } from "@/features/auth/ui/verify-pending-screen/verify-pending-screen.copy";
import { ADD_ON_COPY } from "@/features/booking/ui/add-on-copy/add-on.copy";
import { CATALOG_COPY } from "@/features/booking/ui/catalog-copy/catalog-copy.copy";
import { CLIENT_COPY } from "@/features/booking/ui/client-copy/client-copy.copy";
import { PROJECT_COPY } from "@/features/booking/ui/project-copy/project-copy.copy";
import { TEAM_COPY } from "@/features/booking/ui/team-copy/team-copy.copy";
import { TEMPLATE_COPY } from "@/features/communications/ui/template-copy/template-copy.copy";
import { SOURCE_COPY } from "@/features/gallery/ui/source-copy/source-copy.copy";
import { LANDING_FOOTER_COPY } from "@/features/landing/ui/landing-footer/landing-footer.copy";
import { LANDING_HEADER_COPY } from "@/features/landing/ui/landing-header/landing-header.copy";
import { LANDING_PAGE_COPY } from "@/features/landing/ui/landing-page/landing-page.copy";
import { ROTATING_HEADLINE_COPY } from "@/features/landing/ui/rotating-headline/rotating-headline.copy";
import { WAITLIST_FORM_COPY } from "@/features/landing/ui/waitlist-form/waitlist-form.copy";
import { COMING_SOON_COPY } from "@/features/workspace/ui/coming-soon-screen/coming-soon-screen.copy";
import { CREATE_WORKSPACE_COPY } from "@/features/workspace/ui/create-workspace-dialog/create-workspace-dialog.copy";
import { DASHBOARD_COPY } from "@/features/workspace/ui/dashboard-screen/dashboard-screen.copy";
import { ONBOARDING_COPY } from "@/features/workspace/ui/onboarding-screen/onboarding-screen.copy";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { OWNER_SHELL_COPY } from "@/features/workspace/ui/owner-shell/owner-shell.copy";
import { SETTINGS_COPY } from "@/features/workspace/ui/settings-screen/settings-screen.copy";
import { WORKSPACE_FIELD_ERROR_COPY } from "@/features/workspace/ui/workspace-field-error/workspace-field-error.copy";
import { WORKSPACE_NOT_FOUND_COPY } from "@/features/workspace/ui/workspace-not-found-screen/workspace-not-found-screen.copy";
import { WORKSPACE_SWITCHER_COPY } from "@/features/workspace/ui/workspace-switcher/workspace-switcher.copy";
import { ALERT_COPY } from "@/ui/patterns/alert/alert.copy";
import { APP_SHELL_COPY } from "@/ui/patterns/app-shell/app-shell.copy";
import { BOTTOM_NAV_COPY } from "@/ui/patterns/bottom-nav/bottom-nav.copy";
import { BOTTOM_SHEET_COPY } from "@/ui/patterns/bottom-sheet/bottom-sheet.copy";
import { COMPACT_BAR_COPY } from "@/ui/patterns/compact-bar/compact-bar.copy";
import { EDITORIAL_PANEL_COPY } from "@/ui/patterns/editorial-panel/editorial-panel.copy";
import { FOLDER_TILE_COPY } from "@/ui/patterns/folder-tile/folder-tile.copy";
import { LANGUAGE_SWITCH_COPY } from "@/ui/patterns/language-switch/language-switch.copy";
import { MEDIA_VIEWER_COPY } from "@/ui/patterns/media-viewer/media-viewer.copy";
import { MOBILE_APP_SHELL_COPY } from "@/ui/patterns/mobile-app-shell/mobile-app-shell.copy";
import { MODAL_COPY } from "@/ui/patterns/modal/modal.copy";
import { PAGE_HEADER_COPY } from "@/ui/patterns/page-header/page-header.copy";
import { PHOTO_TILE_COPY } from "@/ui/patterns/photo-tile/photo-tile.copy";
import { SELECT_COPY } from "@/ui/patterns/select/select.copy";
import { SIDEBAR_COPY } from "@/ui/patterns/sidebar/sidebar.copy";
import { SPLIT_LAYOUT_COPY } from "@/ui/patterns/split-layout/split-layout.copy";
import { TOAST_COPY } from "@/ui/patterns/toast/toast.copy";
import { ICON_BUTTON_COPY } from "@/ui/primitives/icon-button/icon-button.copy";
import { STEPPER_COPY } from "@/ui/primitives/stepper/stepper.copy";
import { TEXT_FIELD_COPY } from "@/ui/primitives/text-field/text-field.copy";
import { TEXTAREA_COPY } from "@/ui/primitives/textarea/textarea.copy";
import { TOOLTIP_COPY } from "@/ui/primitives/tooltip/tooltip.copy";

import { PROFILE_LAYOUT_COPY } from "./(owner)/profile/layout.copy";
import { WORKSPACE_LAYOUT_COPY } from "./(owner)/w/[workspaceId]/layout.copy";
import { ERROR_COPY } from "./error.copy";
import { NOT_FOUND_COPY } from "./not-found.copy";
import { HOME_PAGE_COPY } from "./page.copy";

/**
 * Every copy module the app renders, read here in `src/app` and passed into composition (D-8).
 * The root not-found and error screens are the first modules (I5.1); the owner shell follows (I5.3).
 */
export const COPY_REGISTRY: readonly CopyModule[] = [
  NOT_FOUND_COPY,
  ERROR_COPY,
  LANGUAGE_SWITCH_COPY,
  OWNER_SHELL_COPY,
  OWNER_NAV_COPY,
  WORKSPACE_SWITCHER_COPY,
  WORKSPACE_LAYOUT_COPY,
  COMING_SOON_COPY,
  CREATE_WORKSPACE_COPY,
  DASHBOARD_COPY,
  ONBOARDING_COPY,
  SETTINGS_COPY,
  WORKSPACE_FIELD_ERROR_COPY,
  WORKSPACE_NOT_FOUND_COPY,
  SIDEBAR_COPY,
  BOTTOM_SHEET_COPY,
  TOAST_COPY,
  ALERT_COPY,
  FOLDER_TILE_COPY,
  MEDIA_VIEWER_COPY,
  MODAL_COPY,
  PHOTO_TILE_COPY,
  SELECT_COPY,
  ICON_BUTTON_COPY,
  STEPPER_COPY,
  TEXTAREA_COPY,
  TEXT_FIELD_COPY,
  TOOLTIP_COPY,
  APP_SHELL_COPY,
  MOBILE_APP_SHELL_COPY,
  PAGE_HEADER_COPY,
  BOTTOM_NAV_COPY,
  COMPACT_BAR_COPY,
  ACCOUNT_SECTIONS_COPY,
  ACCOUNT_UNAVAILABLE_SCREEN_COPY,
  AUTH_ERROR_COPY,
  CHANGE_PASSWORD_FORM_COPY,
  CONTROLLED_TEXT_FIELD_COPY,
  FORGOT_PASSWORD_FORM_COPY,
  FORGOT_PASSWORD_SCREEN_COPY,
  GOOGLE_BUTTON_COPY,
  INVALID_RESET_LINK_SCREEN_COPY,
  INVALID_VERIFY_LINK_SCREEN_COPY,
  LOGIN_FORM_COPY,
  LOGIN_SCREEN_COPY,
  PROFILE_FORM_COPY,
  REGISTER_FORM_COPY,
  REGISTER_SCREEN_COPY,
  RESEND_VERIFICATION_COPY,
  RESET_PASSWORD_FORM_COPY,
  RESET_PASSWORD_SCREEN_COPY,
  RESET_SENT_SCREEN_COPY,
  VERIFY_PENDING_SCREEN_COPY,
  ADD_ON_COPY,
  CATALOG_COPY,
  CLIENT_COPY,
  TEAM_COPY,
  PROJECT_COPY,
  TEMPLATE_COPY,
  SOURCE_COPY,
  SPLIT_LAYOUT_COPY,
  EDITORIAL_PANEL_COPY,
  PROFILE_LAYOUT_COPY,
  LANDING_HEADER_COPY,
  LANDING_FOOTER_COPY,
  LANDING_PAGE_COPY,
  ROTATING_HEADLINE_COPY,
  WAITLIST_FORM_COPY,
  HOME_PAGE_COPY,
];
