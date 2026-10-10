import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";
import { OWNER_NAV_COPY } from "@/features/workspace/ui/owner-nav/owner-nav.copy";
import { OWNER_SHELL_COPY } from "@/features/workspace/ui/owner-shell/owner-shell.copy";
import { WORKSPACE_SWITCHER_COPY } from "@/features/workspace/ui/workspace-switcher/workspace-switcher.copy";
import { APP_SHELL_COPY } from "@/ui/patterns/app-shell/app-shell.copy";
import { BOTTOM_NAV_COPY } from "@/ui/patterns/bottom-nav/bottom-nav.copy";
import { BOTTOM_SHEET_COPY } from "@/ui/patterns/bottom-sheet/bottom-sheet.copy";
import { COMPACT_BAR_COPY } from "@/ui/patterns/compact-bar/compact-bar.copy";
import { LANGUAGE_SWITCH_COPY } from "@/ui/patterns/language-switch/language-switch.copy";
import { MOBILE_APP_SHELL_COPY } from "@/ui/patterns/mobile-app-shell/mobile-app-shell.copy";
import { PAGE_HEADER_COPY } from "@/ui/patterns/page-header/page-header.copy";
import { SIDEBAR_COPY } from "@/ui/patterns/sidebar/sidebar.copy";
import { TOAST_COPY } from "@/ui/patterns/toast/toast.copy";

import { ERROR_COPY } from "./error.copy";
import { NOT_FOUND_COPY } from "./not-found.copy";

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
  SIDEBAR_COPY,
  BOTTOM_SHEET_COPY,
  TOAST_COPY,
  APP_SHELL_COPY,
  MOBILE_APP_SHELL_COPY,
  PAGE_HEADER_COPY,
  BOTTOM_NAV_COPY,
  COMPACT_BAR_COPY,
];
