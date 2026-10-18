"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { FINISH_PROJECT_BUTTON_COPY_NAMESPACE } from "./finish-project-button.copy";
import type { FinishProjectButtonProps } from "./finish-project-button.types";
import { useFinishProject } from "./use-finish-project";

/** The project header's *Tandai selesai* on a DELIVERED project: a confirm, then the write (BR-PRJ-004). @param props - ids, the project title and the server action @returns the button and its confirm */
export function FinishProjectButton(props: Readonly<FinishProjectButtonProps>) {
  const t = useTranslations(FINISH_PROJECT_BUTTON_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const flow = useFinishProject(props);
  const renderPrimary = (isPrimaryMobile: boolean) => (
    <Button
      size={isPrimaryMobile ? "lg" : "md"}
      isPending={flow.isPending}
      className="max-md:w-full"
      onPress={flow.confirm}
    >
      {t("finish")}
    </Button>
  );
  return (
    <>
      <Button
        size={isMobile ? "lg" : "md"}
        iconLeading="circle-check-big"
        className="max-md:w-full"
        onPress={flow.open}
      >
        {t("finish")}
      </Button>
      <GalleryDialogShell
        isOpen={flow.isOpen}
        onOpenChange={flow.onOpenChange}
        title={t("finishTitle")}
        description={t("finishDescription", { title: props.title })}
        size="md"
        isPending={flow.isPending}
        renderPrimary={renderPrimary}
      >
        {null}
      </GalleryDialogShell>
    </>
  );
}
