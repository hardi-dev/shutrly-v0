import { cn } from "@/ui/cn/cn";

import type { StatusChipProps, StatusChipTone } from "./status-chip.types";

const TONE: Record<StatusChipTone, string> = {
  success:
    "bg-(--component-chip-status-success-background) text-(--component-chip-status-success-text)",
  info: "bg-(--component-chip-status-info-background) text-(--component-chip-status-info-text)",
  warning:
    "bg-(--component-chip-status-warning-background) text-(--component-chip-status-warning-text)",
  danger:
    "bg-(--component-chip-status-danger-background) text-(--component-chip-status-danger-text)",
  accent:
    "bg-(--component-chip-status-accent-background) text-(--component-chip-status-accent-text)",
  neutral:
    "bg-(--component-chip-status-neutral-background) text-(--component-chip-status-neutral-text)",
};

/**
 * Renders a short, non-interactive status label with a tone and an optional dot (C12).
 * @param props - tone, label and dot visibility
 * @returns the status chip
 */
export function StatusChip({ tone, label, hasDot = true, className }: Readonly<StatusChipProps>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-(--component-chip-status-gap) rounded-(--component-chip-status-radius)",
        "px-(--component-chip-status-padding-x) py-(--component-chip-status-padding-y)",
        "text-(length:--font-size-caption) font-semibold whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {hasDot ? (
        <span data-slot="dot" aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
