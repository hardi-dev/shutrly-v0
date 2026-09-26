import type { PropsWithChildren } from "react";

import { EditorialPanel } from "../editorial-panel/editorial-panel";
import { AUTH_SPLIT_LAYOUT_COPY } from "./auth-split-layout.copy";

/**
 * The auth screens' frame (auth.pen amp4Y / IOC5i): brand, form column and footer; the
 * editorial panel only from the desktop breakpoint.
 * @param props - the screen content
 * @returns the layout
 */
export function AuthSplitLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="grid min-h-dvh bg-(--color-semantic-surface-panel) lg:grid-cols-[var(--size-auth-panel)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col p-(--space-6) lg:p-(--space-12)">
        <p className="flex items-center gap-(--space-2)">
          <span
            aria-hidden="true"
            className="size-(--space-4) rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)"
          />
          <span className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
            {AUTH_SPLIT_LAYOUT_COPY.brand}
          </span>
        </p>
        <div className="flex flex-1 flex-col items-center justify-center py-(--space-8)">
          <div className="flex w-full flex-col gap-(--space-6) lg:w-(--size-auth-form)">
            {children}
          </div>
        </div>
        <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
          {AUTH_SPLIT_LAYOUT_COPY.footer}
        </p>
      </main>
      <div data-slot="editorial" className="hidden lg:block">
        <EditorialPanel />
      </div>
    </div>
  );
}
