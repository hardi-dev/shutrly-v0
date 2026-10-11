"use client";

import { useTranslations } from "next-intl";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_TAB_MESSAGE_KEY } from "../project-copy/project-copy.copy";
import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { PROJECT_FILTER_DIALOG_COPY_NAMESPACE } from "./project-filter-dialog.copy";
import type { ProjectFilterDialogProps } from "./project-filter-dialog.types";
import { ProjectFilterForm } from "./project-filter-form";
import { useFilterDraft } from "./use-filter-draft";

/** The Filter proyek dialog: a modal on desktop, a form sheet on phones; Terapkan writes the URL (AC-PRJ-028). */
export function ProjectFilterDialog(props: Readonly<ProjectFilterDialogProps>) {
  const t = useTranslations(PROJECT_FILTER_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const api = useFilterDraft(props);
  const handleApply = () => {
    if (api.apply()) props.onOpenChange(false);
  };
  const handleReset = () => {
    api.reset();
    props.onOpenChange(false);
  };
  const { apply, reset } = filterButtons(t, isMobile ? "lg" : "md", handleApply, handleReset);
  const body = <ProjectFilterForm props={props} api={api} />;
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={t("filterTitle")}
        description={filterDescription(t, props.tab)}
        variant="form"
        actions={
          <div className="flex w-full flex-col gap-(--space-3)">
            {apply}
            {reset}
          </div>
        }
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={t("filterTitle")}
      description={filterDescription(t, props.tab)}
      size="md"
      actions={
        <>
          {reset}
          {apply}
        </>
      }
    >
      {body}
    </Modal>
  );
}

function filterDescription(t: ProjectTranslate, tab: ProjectTab): string {
  return t("filterDescription", { tabName: t(PROJECT_TAB_MESSAGE_KEY[tab]) });
}

function filterButtons(
  t: ProjectTranslate,
  size: "md" | "lg",
  onApply: () => void,
  onReset: () => void,
) {
  return {
    apply: (
      <Button size={size} className="max-md:w-full" onPress={onApply}>
        {t("filterApply")}
      </Button>
    ),
    reset: (
      <Button variant="secondary" size={size} className="max-md:w-full" onPress={onReset}>
        {t("filterReset")}
      </Button>
    ),
  };
}
