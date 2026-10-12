"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";
import { CREATE_PROJECT_SCREEN_COPY_NAMESPACE } from "./create-project-screen.copy";

/** Simpan draf and Buat proyek: right-aligned under the form on desktop, a sticky half-width bar on phones. */
export function CreateProjectActions({
  state,
  isDisabled = false,
}: Readonly<{ state: CreateProjectState; isDisabled?: boolean }>) {
  const t = useTranslations(CREATE_PROJECT_SCREEN_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const size = isMobile ? "lg" : "md";
  const handleSaveDraft = () => {
    void state.submit("DRAFT");
  };
  const handleCreate = () => {
    void state.submit("BOOKED");
  };
  return (
    <div className="sticky bottom-0 z-10 flex gap-(--space-3) border-t border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-4) max-md:-mx-(--space-4) max-md:-mb-(--space-5) md:static md:justify-end md:border-0 md:bg-transparent md:p-0">
      <Button
        variant="secondary"
        size={size}
        className="max-md:min-w-0 max-md:flex-1 max-md:px-(--space-3)"
        isPending={state.pendingMode === "DRAFT"}
        isDisabled={isDisabled || state.pendingMode === "BOOKED"}
        onPress={handleSaveDraft}
      >
        {state.pendingMode === "DRAFT" ? t("savingDraft") : t("saveDraft")}
      </Button>
      <Button
        size={size}
        className="max-md:min-w-0 max-md:flex-1 max-md:px-(--space-3)"
        isPending={state.pendingMode === "BOOKED"}
        isDisabled={isDisabled || state.pendingMode === "DRAFT"}
        onPress={handleCreate}
      >
        {state.pendingMode === "BOOKED" ? t("creating") : t("create")}
      </Button>
    </div>
  );
}
