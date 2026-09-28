import { MobileHeader } from "../mobile-header/mobile-header";
import { MOBILE_APP_SHELL_COPY } from "./mobile-app-shell.copy";
import type { MobileAppShellProps } from "./mobile-app-shell.types";

/** Renders the responsive mobile Owner shell with app bar, content and Bottom Nav slots (C35). */
export function MobileAppShell({
  title,
  children,
  bottomNav,
  actions,
  sheet,
  isOverlayOpen = false,
  workspace = "Workspace",
  utilities,
  onWorkspacePress,
}: Readonly<MobileAppShellProps>) {
  return (
    <div className="flex w-full min-h-dvh flex-col bg-(--color-semantic-surface-canvas)">
      <a href="#mobile-app-content" className="sr-only focus:not-sr-only">
        {MOBILE_APP_SHELL_COPY.skip}
      </a>
      <MobileHeader
        workspace={workspace}
        title={title}
        utilities={utilities ?? actions}
        onWorkspacePress={onWorkspacePress}
      />
      <main
        id="mobile-app-content"
        inert={isOverlayOpen || undefined}
        className="min-h-0 flex-1 overflow-y-auto p-(--space-4)"
      >
        {children}
      </main>
      <div inert={isOverlayOpen || undefined}>{bottomNav}</div>
      {sheet}
    </div>
  );
}
