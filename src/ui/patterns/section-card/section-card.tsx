import { useId } from "react";

import { cn } from "@/ui/cn/cn";

import type { SectionCardContent, SectionCardProps } from "./section-card.types";

// Compact insets below md (phone), Default from md up — the Mobile Header breakpoint (C43).
const CONTENT_INSETS: Record<SectionCardContent, string> = {
  padded:
    "gap-(--component-section-card-content-gap) p-(--component-section-card-compact-content-padding) md:p-(--component-section-card-content-padding)",
  flush:
    "py-(--component-section-card-flush-padding-y) px-(--component-section-card-compact-flush-padding-x) md:px-(--component-section-card-flush-padding-x)",
  bleed: "",
};

/**
 * A titled card (C43) that groups one kind of content: fields, list rows, table rows or an
 * empty state. Without a title the header is omitted and `aria-label` names the region.
 * @param props - title, description, header actions, content inset mode and the content
 * @returns the section card
 */
export function SectionCard({
  title,
  description,
  actions,
  content = "padded",
  "aria-label": ariaLabel,
  className,
  children,
}: Readonly<SectionCardProps>) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      className={cn(
        "flex flex-col overflow-hidden rounded-(--component-section-card-radius) border border-(--component-section-card-border) bg-(--component-section-card-background)",
        className,
      )}
    >
      {title ? (
        <header className="flex items-center gap-(--component-section-card-header-actions-gap) border-b border-(--component-section-card-header-border) px-(--component-section-card-compact-header-padding-x) py-(--component-section-card-compact-header-padding-y) md:px-(--component-section-card-header-padding-x) md:py-(--component-section-card-header-padding-y)">
          <div className="flex min-w-0 flex-1 flex-col gap-(--component-section-card-header-gap)">
            <h2
              id={titleId}
              className="text-(length:--font-size-subtitle) font-bold text-(--component-section-card-title)"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-(length:--font-size-body-sm) leading-(--font-line-height-body) text-(--component-section-card-description)">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-(--space-2)">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div
        data-testid="section-card-content"
        className={cn("flex flex-col", CONTENT_INSETS[content])}
      >
        {children}
      </div>
    </section>
  );
}
