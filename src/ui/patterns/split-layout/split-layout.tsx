import { EditorialPanel } from "../editorial-panel/editorial-panel";
import { SPLIT_LAYOUT_COPY } from "./split-layout.copy";
import type { SplitLayoutProps } from "./split-layout.types";

/** The auth frame with a responsive form column and editorial panel. */
export function SplitLayout({ children, editorial }: Readonly<SplitLayoutProps>) {
  return (
    <div className="grid min-h-dvh overflow-hidden bg-(--color-semantic-surface-panel) lg:grid-cols-[var(--size-auth-panel)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col p-(--space-6) lg:p-(--space-12)">
        <p className="flex items-center gap-(--space-2)">
          <span
            aria-hidden="true"
            className="size-(--space-4) rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)"
          />
          <span className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
            {SPLIT_LAYOUT_COPY.brand}
          </span>
        </p>
        <div className="flex flex-1 flex-col items-center justify-center py-(--space-8)">
          <div className="flex w-full max-w-(--size-auth-form) flex-col gap-(--space-6)">
            {children}
          </div>
        </div>
        <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
          {SPLIT_LAYOUT_COPY.footer}
        </p>
      </main>
      <div data-slot="editorial" className="hidden lg:block">
        {editorial ?? (
          <EditorialPanel>
            <span className="text-(length:--font-size-hero) leading-(--font-line-height-tight) font-bold whitespace-pre-line text-(--color-semantic-text-inverse)">
              {SPLIT_LAYOUT_COPY.headline}
            </span>
          </EditorialPanel>
        )}
      </div>
    </div>
  );
}
