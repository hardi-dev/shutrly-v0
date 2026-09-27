import type { ThemeFrameProps } from "./theme.types";

export function ThemeFrame({ mode, children }: Readonly<ThemeFrameProps>) {
  return (
    <div
      data-theme={mode}
      className="min-h-screen bg-(--color-semantic-surface-muted) p-(--space-6) text-(--color-semantic-text-primary)"
    >
      {children}
    </div>
  );
}
