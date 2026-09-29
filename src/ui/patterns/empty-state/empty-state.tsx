import { Icon } from "@/ui/primitives/icon/icon";

import type { EmptyStateProps } from "./empty-state.types";

const ICON_TONE_CLASSES = {
  accent: {
    background: "bg-(--color-semantic-accent-soft)",
    foreground: "text-(--color-semantic-accent-soft-fg)",
  },
  primary: {
    background: "bg-(--color-semantic-action-primary)",
    foreground: "text-(--color-semantic-action-on-primary)",
  },
  danger: {
    background: "bg-(--color-semantic-status-danger-bg)",
    foreground: "text-(--color-semantic-status-danger-fg)",
  },
} as const;

export function EmptyState({
  icon,
  iconTone = "accent",
  title,
  body,
  action,
}: Readonly<EmptyStateProps>) {
  const tone = ICON_TONE_CLASSES[iconTone];

  return (
    <section
      data-testid="empty-state"
      className="flex w-full flex-col items-center gap-(--space-4) rounded-(--radius-md) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-subtle) p-(--space-12) text-center"
    >
      <div
        data-testid="empty-state-icon-wrap"
        className={`flex size-(--space-12) items-center justify-center rounded-(--radius-md) ${tone.background}`}
      >
        <Icon
          name={icon}
          size="lg"
          data-testid="empty-state-icon"
          aria-hidden="true"
          className={tone.foreground}
        />
      </div>
      <div className="flex w-full flex-col items-center gap-(--space-1)">
        <h2 className="text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary)">
          {title}
        </h2>
        <p className="w-full max-w-(--size-editorial-card) text-(length:--font-size-body-sm) leading-(--font-line-height-body) text-(--color-semantic-text-secondary)">
          {body}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
