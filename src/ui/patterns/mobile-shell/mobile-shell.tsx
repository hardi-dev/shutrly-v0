import type { MobileShellProps } from "./mobile-shell.types";

/** Renders the mobile sub-page content sheet with persistent bottom navigation (C33). */
export function MobileShell({ compactBar, bottomNav, children }: Readonly<MobileShellProps>) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--color-semantic-surface-muted)">
      {compactBar}
      <main className="min-h-0 flex-1 overflow-y-auto rounded-t-(--component-panel-app-radius) bg-(--color-semantic-surface-canvas) px-(--space-4) py-(--space-5)">
        {children}
      </main>
      {bottomNav}
    </div>
  );
}
