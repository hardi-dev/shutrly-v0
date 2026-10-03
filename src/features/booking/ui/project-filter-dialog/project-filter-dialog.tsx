"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { ProjectFilterDialogProps } from "./project-filter-dialog.types";
import { ProjectFilterForm } from "./project-filter-form";
import { useFilterDraft } from "./use-filter-draft";

/** The Filter proyek dialog: a modal on desktop, a form sheet on phones; Terapkan writes the URL (AC-PRJ-028). */
export function ProjectFilterDialog(props: Readonly<ProjectFilterDialogProps>) {
  const isMobile = useMobileViewport();
  const api = useFilterDraft(props);
  const handleApply = () => {
    if (api.apply()) props.onOpenChange(false);
  };
  const handleReset = () => {
    api.reset();
    props.onOpenChange(false);
  };
  const { apply, reset } = filterButtons(isMobile ? "lg" : "md", handleApply, handleReset);
  const body = <ProjectFilterForm props={props} api={api} />;
  const description = PROJECT_COPY.filterDescription(props.tab);
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={PROJECT_COPY.filterTitle}
        description={description}
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
      title={PROJECT_COPY.filterTitle}
      description={description}
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

function filterButtons(size: "md" | "lg", onApply: () => void, onReset: () => void) {
  return {
    apply: (
      <Button size={size} className="max-md:w-full" onPress={onApply}>
        {PROJECT_COPY.filterApply}
      </Button>
    ),
    reset: (
      <Button variant="secondary" size={size} className="max-md:w-full" onPress={onReset}>
        {PROJECT_COPY.filterReset}
      </Button>
    ),
  };
}
