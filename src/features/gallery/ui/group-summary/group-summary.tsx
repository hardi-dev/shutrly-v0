import { cn } from "@/ui/cn/cn";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { GroupSummaryProps } from "./group-summary.types";

const TONES = { OPEN: "info", SUBMITTED: "warning", LOCKED: "neutral" } as const;

function usageText({ status, usage, limit, unit }: Readonly<GroupSummaryProps>): string {
  const label = unit ?? CLIENT_COPY.defaultUnit;
  if (status === "SUBMITTED") return CLIENT_COPY.usageSubmitted(usage, label);
  if (status === "LOCKED") return CLIENT_COPY.usageLocked(usage, label);
  return CLIENT_COPY.usageOpen(usage, limit, label);
}

/** One selection group's status, usage bar and next action (local *Group Summary* SBwD1, BR-SEL-007, AC-SEL-001). @param props - group facts and the action @returns the summary */
export function GroupSummary(props: Readonly<GroupSummaryProps>) {
  const { name, status, progress, action, className } = props;
  return (
    <div className={cn("flex flex-col gap-(--space-3) p-(--space-3)", className)}>
      <div className="flex items-center justify-between gap-(--space-2)">
        <h3 className="truncate text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
          {name}
        </h3>
        <StatusChip tone={TONES[status]} label={CLIENT_COPY.groupStatus[status]} />
      </div>
      <div
        aria-hidden="true"
        className="h-(--space-1-5) w-full overflow-hidden rounded-(--radius-full) bg-(--color-semantic-surface-subtle)"
      >
        <div
          className="h-full rounded-(--radius-full) bg-(--color-semantic-progress-positive)"
          style={{ width: `${String(Math.round(progress * 100))}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-(--space-3)">
        <p className="flex-1 text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {usageText(props)}
        </p>
        {action}
      </div>
    </div>
  );
}
