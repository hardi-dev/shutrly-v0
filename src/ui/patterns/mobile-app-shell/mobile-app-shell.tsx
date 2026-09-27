import { IconButton } from "@/ui/primitives/icon-button/icon-button";

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
}: Readonly<MobileAppShellProps>) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-semantic-surface-canvas)">
      <a href="#mobile-app-content" className="sr-only focus:not-sr-only">
        {MOBILE_APP_SHELL_COPY.skip}
      </a>
      <header className="flex h-[106px] shrink-0 flex-col justify-end border-b border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel)">
        <div className="flex h-[52px] items-center gap-(--space-1) px-(--space-4)">
          <h1 className="flex-1 text-(--color-semantic-text-primary) text-[18px] font-bold">
            {title}
          </h1>
          <IconButton icon="search" size="md" aria-label={MOBILE_APP_SHELL_COPY.search} />
          <IconButton icon="info" size="md" aria-label={MOBILE_APP_SHELL_COPY.notifications} />
          {actions}
        </div>
      </header>
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
