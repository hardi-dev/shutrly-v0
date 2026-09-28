import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { ALERT_COPY } from "./alert.copy";
import type { AlertProps, AlertTone } from "./alert.types";

// C24 Alert (docs/design-system/components/alert.md): Close off, icon fixed by tone.
const TONE: Record<AlertTone, string> = {
  success: "bg-(--component-alert-success-background) border-(--component-alert-success-border)",
  info: "bg-(--component-alert-info-background) border-(--component-alert-info-border)",
  warning: "bg-(--component-alert-warning-background) border-(--component-alert-warning-border)",
  danger: "bg-(--component-alert-danger-background) border-(--component-alert-danger-border)",
  highlight:
    "bg-(--component-alert-highlight-background) border-(--component-alert-highlight-border)",
};
const ICON_TONE: Record<AlertTone, string> = {
  success: "text-(--component-alert-success-icon)",
  info: "text-(--component-alert-info-icon)",
  warning: "text-(--component-alert-warning-icon)",
  danger: "text-(--component-alert-danger-icon)",
  highlight: "text-(--component-alert-highlight-icon)",
};
const TITLE_TONE: Record<AlertTone, string> = {
  success: "text-(--component-alert-success-title)",
  info: "text-(--component-alert-info-title)",
  warning: "text-(--component-alert-warning-title)",
  danger: "text-(--component-alert-danger-title)",
  highlight: "text-(--component-alert-highlight-title)",
};
const LIVE_ROLE: Record<AlertTone, "status" | "alert"> = {
  success: "status",
  info: "status",
  warning: "alert",
  danger: "alert",
  highlight: "status",
};

/**
 * Inline message in the page flow (design-system C24). Static guidance is not announced; live
 * feedback uses `role=status` (info) or `role=alert` (danger) and can take focus (AC-AUTH-023).
 * @param props - tone, title, optional body, and whether it is live feedback
 * @returns the alert
 */
// eslint-disable-next-line max-lines-per-function -- Alert owns its optional close-control layout.
export function Alert({
  tone,
  title,
  body,
  live = false,
  onClose,
  closeLabel = ALERT_COPY.close,
  titleId,
  bodyId,
  className,
  ref,
  action,
}: Readonly<AlertProps>) {
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
      <Icon
        name={tone === "danger" || tone === "warning" ? "circle-alert" : "info"}
        className={ICON_TONE[tone]}
      />
      <div className="flex min-w-0 flex-col gap-(--component-alert-text-gap)">
        <p
          id={titleId}
          className={cn("text-(length:--font-size-body-sm) font-semibold", TITLE_TONE[tone])}
        >
          {title}
        </p>
        {body ? (
          <p id={bodyId} className="text-(length:--font-size-label) text-(--component-alert-body)">
            {body}
          </p>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={action.onAction}
            className="self-start font-semibold underline"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      {onClose ? (
        <IconButton
          icon="x"
          size="sm"
          aria-label={closeLabel}
          onPress={onClose}
          className="ml-auto"
        />
      ) : null}
    </div>
  );
}
