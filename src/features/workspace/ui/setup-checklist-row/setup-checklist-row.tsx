import Link from "next/link";
import { useTranslations } from "next-intl";

import type {
  SetupStep,
  SetupStepKey,
} from "@/features/workspace/domain/setup-checklist/setup-checklist.types";
import { cn } from "@/ui/cn/cn";
import { LIST_CARD_ROW } from "@/ui/patterns/list-card-item/list-card-item";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";
import type { IconName } from "@/ui/primitives/icon/icon.types";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";
import type { StatusChipTone } from "@/ui/primitives/status-chip/status-chip.types";

import { setupStepHref } from "../setup-step-href/setup-step-href";
import { SETUP_CHECKLIST_ROW_COPY_NAMESPACE } from "./setup-checklist-row.copy";
import type { SetupChecklistRowProps } from "./setup-checklist-row.types";

const STEP_COPY = {
  service: { title: "serviceTitle", body: "serviceBody", action: "serviceAction" },
  packageItems: {
    title: "packageItemsTitle",
    body: "packageItemsBody",
    action: "packageItemsAction",
  },
  firstProject: {
    title: "firstProjectTitle",
    body: "firstProjectBody",
    action: "firstProjectAction",
  },
  // Step 4 is never current (D-3), so its approved action row is not in the copy module (D-10).
  brandName: { title: "brandNameTitle", body: "brandNameBody", action: "brandNameTitle" },
} as const;

const STEP_ICON: Record<SetupStepKey, IconName> = {
  service: "briefcase",
  packageItems: "list-checks",
  firstProject: "folder-plus",
  brandName: "badge-check",
};

const STEP_MARKER: Partial<
  Record<SetupStepKey, { tone: StatusChipTone; key: "required" | "recommended" | "optional" }>
> = {
  service: { tone: "warning", key: "required" },
  packageItems: { tone: "info", key: "recommended" },
  brandName: { tone: "neutral", key: "optional" },
};

// Trailing is as tall as an MD button, so rows with and without one line up (design D-8).
const TRAILING_HEIGHT =
  "md:min-h-[calc(2*var(--component-button-md-padding-y)+1lh)] text-(length:--font-size-body)";

// Below md the current step's button wraps under its text, aligned with the title (design SP1).
const PHONE_ACTION_INSET =
  "basis-full pl-[calc(var(--space-9)+var(--component-list-card-item-gap))] md:basis-auto md:pl-0";

function iconOf(step: SetupStep): IconName {
  if (step.state === "done") return "check";
  if (step.state === "locked") return "lock";
  return STEP_ICON[step.key];
}

function StepMarker({ step }: Readonly<{ step: SetupStep }>) {
  const t = useTranslations(SETUP_CHECKLIST_ROW_COPY_NAMESPACE);
  if (step.state === "done") return <StatusChip tone="success" label={t("done")} />;
  const marker = STEP_MARKER[step.key];
  return marker ? <StatusChip tone={marker.tone} label={t(marker.key)} /> : null;
}

function StepIcon({ step }: Readonly<{ step: SetupStep }>) {
  const isDone = step.state === "done";
  const name = iconOf(step);
  return (
    <span
      className={cn(
        "flex size-(--space-9) shrink-0 items-center justify-center rounded-(--component-list-card-item-icon-radius)",
        isDone
          ? "bg-(--color-semantic-status-success-bg) text-(--color-semantic-status-success-fg)"
          : "bg-(--component-list-card-item-icon-background) text-(--component-list-card-item-icon)",
        step.state === "locked" && "text-(--color-semantic-text-muted)",
      )}
    >
      <Icon name={name} size="md" aria-hidden="true" />
    </span>
  );
}

function StepText({ step, workspaceName }: Readonly<{ step: SetupStep; workspaceName: string }>) {
  const t = useTranslations(SETUP_CHECKLIST_ROW_COPY_NAMESPACE);
  const copy = STEP_COPY[step.key];
  const isEmphasised = step.state === "current" || step.state === "open";
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-(--component-list-card-item-text-gap)">
      <span className="flex flex-wrap items-center gap-(--space-2)">
        <span
          className={cn(
            "text-(length:--font-size-body) font-semibold",
            isEmphasised
              ? "text-(--component-list-card-item-title)"
              : "text-(--color-semantic-text-secondary)",
          )}
        >
          {t(copy.title)}
        </span>
        <StepMarker step={step} />
      </span>
      <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-muted)">
        {step.state === "locked" ? t("lockedHint") : t(copy.body, { workspaceName })}
      </span>
    </span>
  );
}

/**
 * One setup checklist step (F-25 D-7): the current step carries the checklist's only button, an
 * open step is one link named by its title, done and locked steps have no action.
 * @param props - the step, its workspace and its position
 * @returns the list item
 */
export function SetupChecklistRow(props: Readonly<SetupChecklistRowProps>) {
  const { workspaceId, workspaceName, step, isLast = false } = props;
  const t = useTranslations(SETUP_CHECKLIST_ROW_COPY_NAMESPACE);
  const href = setupStepHref(workspaceId, step.target);
  const body = (
    <>
      <StepIcon step={step} />
      <StepText step={step} workspaceName={workspaceName} />
    </>
  );
  return (
    <li className={cn(!isLast && "border-b border-(--component-list-card-item-border)")}>
      {step.state === "open" ? (
        <Link
          href={href}
          aria-label={t(STEP_COPY[step.key].title)}
          className={cn(
            LIST_CARD_ROW,
            // The card clips outer shadows, so the focus ring is drawn inside the row (token-usage §2, C-008).
            "outline-none hover:bg-(--color-semantic-surface-subtle) focus-visible:shadow-[inset_0_0_0_2px_var(--color-semantic-focus-ring)]",
          )}
        >
          {body}
          <span className={cn("flex shrink-0 items-center", TRAILING_HEIGHT)}>
            <Icon
              name="chevron-right"
              size="sm"
              aria-hidden="true"
              className="text-(--color-semantic-text-muted)"
            />
          </span>
        </Link>
      ) : (
        <div className={cn(LIST_CARD_ROW, "flex-wrap gap-y-(--component-list-card-item-gap)")}>
          {body}
          <span
            className={cn(
              "flex shrink-0 items-center",
              TRAILING_HEIGHT,
              step.state === "current" && PHONE_ACTION_INSET,
            )}
          >
            {step.state === "current" ? (
              <Button href={href}>{t(STEP_COPY[step.key].action)}</Button>
            ) : null}
          </span>
        </div>
      )}
    </li>
  );
}
