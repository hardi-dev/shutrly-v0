import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { AlertProps, AlertTone } from "./alert.types";

// C24 Alert (docs/design-system/components/alert.md): Close off, icon fixed by tone.
const TONE: Record<AlertTone, string> = {
  info: "bg-(--component-alert-info-background) border-(--component-alert-info-border)",
  danger: "bg-(--component-alert-danger-background) border-(--component-alert-danger-border)",
};
const ICON_TONE: Record<AlertTone, string> = {
  info: "text-(--component-alert-info-icon)",
  danger: "text-(--component-alert-danger-icon)",
};
const TITLE_TONE: Record<AlertTone, string> = {
  info: "text-(--component-alert-info-title)",
  danger: "text-(--component-alert-danger-title)",
};
const LIVE_ROLE: Record<AlertTone, "status" | "alert"> = { info: "status", danger: "alert" };

/**
 * Inline message in the page flow (design-system C24). Static guidance is not announced; live
 * feedback uses `role=status` (info) or `role=alert` (danger) and can take focus (AC-AUTH-023).
 * @param props - tone, title, optional body, and whether it is live feedback
 * @returns the alert
 */
export function Alert({ tone, title, body, live = false, className, ref }: Readonly<AlertProps>) {
  return (
    <div
      ref={ref}
      role={live ? LIVE_ROLE[tone] : undefined}
      tabIndex={-1}
      data-tone={tone}
      className={cn(
        "flex w-full items-start gap-(--component-alert-gap) rounded-(--component-alert-radius)",
        "border px-(--component-alert-padding-x) py-(--component-alert-padding-y) outline-none",
        TONE[tone],
        className,
      )}
    >
      <Icon name={tone === "info" ? "info" : "circle-alert"} className={ICON_TONE[tone]} />
      <div className="flex min-w-0 flex-col gap-(--component-alert-text-gap)">
        <p className={cn("text-(length:--font-size-body-sm) font-semibold", TITLE_TONE[tone])}>
          {title}
        </p>
        {body ? (
          <p className="text-(length:--font-size-label) text-(--component-alert-body)">{body}</p>
        ) : null}
      </div>
    </div>
  );
}
