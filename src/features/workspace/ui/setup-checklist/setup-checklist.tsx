import { useTranslations } from "next-intl";

import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { SetupChecklistRow } from "../setup-checklist-row/setup-checklist-row";
import { SETUP_CHECKLIST_COPY_NAMESPACE } from "./setup-checklist.copy";
import type { SetupChecklistProps } from "./setup-checklist.types";

/**
 * The dashboard setup checklist (F-25): a flush Section Card with the progress and one row per
 * step, centered in the content area, also vertically on the desktop shell (D-8).
 * @param props - the workspace and its derived checklist
 * @returns the checklist region
 */
export function SetupChecklist({
  workspaceId,
  workspaceName,
  checklist,
}: Readonly<SetupChecklistProps>) {
  const t = useTranslations(SETUP_CHECKLIST_COPY_NAMESPACE);
  const lastIndex = checklist.steps.length - 1;
  return (
    <div className="flex w-full flex-1 flex-col items-center xl:justify-center">
      <SectionCard
        title={t("title")}
        description={t("description")}
        content="flush"
        className="w-full max-w-(--size-content-narrow)"
        actions={
          <span className="text-(length:--font-size-body-sm) font-semibold whitespace-nowrap text-(--color-semantic-text-secondary)">
            {t("progress", { done: checklist.doneCount, total: checklist.total })}
          </span>
        }
      >
        <ol>
          {checklist.steps.map((step, index) => (
            <SetupChecklistRow
              key={step.key}
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              step={step}
              isLast={index === lastIndex}
            />
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
