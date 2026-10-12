import { useTranslations } from "next-intl";

import { MobileHeader } from "../mobile-header/mobile-header";
import { MOBILE_APP_SHELL_COPY_NAMESPACE } from "./mobile-app-shell.copy";
import type { MobileAppShellProps } from "./mobile-app-shell.types";

/** Renders the responsive mobile Owner shell with app bar, content and Bottom Nav slots (C35). */
export function MobileAppShell({
  title,
  subtitle,
  children,
  bottomNav,
  actions,
  sheet,
  isOverlayOpen = false,
  // DECK GAP: no copy-deck row or Indonesian text for this placeholder workspace name; kept as-is.
  workspace = "Workspace",
  utilities,
  onWorkspacePress,
  header,
}: Readonly<MobileAppShellProps>) {
  const t = useTranslations(MOBILE_APP_SHELL_COPY_NAMESPACE);
  return (
    <div className="flex w-full min-h-dvh flex-col bg-(--color-semantic-surface-muted)">
      <a href="#mobile-app-content" className="sr-only focus:not-sr-only">
        {t("skip")}
      </a>
      {header ?? (
        <MobileHeader
          workspace={workspace}
          title={title}
          subtitle={subtitle}
          utilities={utilities ?? actions}
          onWorkspacePress={onWorkspacePress}
        />
      )}
      <main
        id="mobile-app-content"
        tabIndex={-1}
        inert={isOverlayOpen || undefined}
        className="min-h-0 flex-1 overflow-y-auto rounded-t-(--component-panel-app-radius) bg-(--color-semantic-surface-canvas) px-(--space-4) py-(--space-5) outline-none"
      >
        {children}
      </main>
      <div inert={isOverlayOpen || undefined}>{bottomNav}</div>
      {sheet}
    </div>
  );
}
