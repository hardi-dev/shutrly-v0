"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";

/** Simpan draf and Buat proyek: right-aligned under the form on desktop, a sticky half-width bar on phones. */
export function CreateProjectActions({ state }: Readonly<{ state: CreateProjectState }>) {
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
        className="max-md:flex-1"
        isPending={state.pendingMode === "DRAFT"}
        isDisabled={state.pendingMode === "BOOKED"}
        onPress={handleSaveDraft}
      >
        {state.pendingMode === "DRAFT" ? PROJECT_COPY.savingDraft : PROJECT_COPY.saveDraft}
      </Button>
      <Button
        size={size}
        className="max-md:flex-1"
        isPending={state.pendingMode === "BOOKED"}
        isDisabled={state.pendingMode === "DRAFT"}
        onPress={handleCreate}
      >
        {state.pendingMode === "BOOKED" ? PROJECT_COPY.creating : PROJECT_COPY.create}
      </Button>
    </div>
  );
}
