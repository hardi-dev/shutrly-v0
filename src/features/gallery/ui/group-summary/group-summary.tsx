import { useTranslations } from "next-intl";

import { cn } from "@/ui/cn/cn";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import { GROUP_SUMMARY_NAMESPACE } from "./group-summary.copy";
import type { GroupSummaryProps } from "./group-summary.types";

const TONES = { OPEN: "info", SUBMITTED: "warning", LOCKED: "neutral" } as const;
const STATUS_KEYS = {
  OPEN: "groupStatusOpen",
  SUBMITTED: "groupStatusSubmitted",
  LOCKED: "groupStatusLocked",
} as const;

function usageText(t: ClientTranslate, props: Readonly<GroupSummaryProps>): string {
  const { status, usage, limit, unit, remaining } = props;
  const label = unit ?? t("defaultUnit");
  if (status === "SUBMITTED") return t("usageSubmitted", { usage, unit: label });
  if (status === "LOCKED") return t("usageLocked", { usage, unit: label });
  if (remaining !== undefined) return t("usageReview", { usage, limit, unit: label, remaining });
  return t("usageOpen", { usage, limit, unit: label });
}

/** One selection group's status, usage bar and next action (local *Group Summary* SBwD1, BR-SEL-007, AC-SEL-001). @param props - group facts and the action @returns the summary */
export function GroupSummary(props: Readonly<GroupSummaryProps>) {
  const { name, status, progress, isFull = false, action, className } = props;
  const t = useTranslations(GROUP_SUMMARY_NAMESPACE);
  return (
    <div className={cn("flex flex-col gap-(--space-3) p-(--space-3)", className)}>
      <div className="flex items-center justify-between gap-(--space-2)">
        <h3 className="truncate text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
          {name}
        </h3>
        <StatusChip tone={TONES[status]} label={t(STATUS_KEYS[status])} />
      </div>
      <div
        aria-hidden="true"
        className="h-(--space-1-5) w-full overflow-hidden rounded-(--radius-full) bg-(--color-semantic-surface-subtle)"
      >
        <div
          className={cn(
            "h-full rounded-(--radius-full)",
            // pilih-batas-tercapai: the bar turns warning once the group is full.
            isFull
              ? "bg-(--color-semantic-status-warning-fg)"
              : "bg-(--color-semantic-progress-positive)",
          )}
          style={{ width: `${String(Math.round(progress * 100))}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
        <p className="flex-1 text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {usageText(t, props)}
        </p>
        {action}
      </div>
    </div>
  );
}
