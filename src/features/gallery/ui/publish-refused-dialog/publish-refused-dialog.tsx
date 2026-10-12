"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { PUBLISH_REFUSED_DIALOG_COPY_NAMESPACE } from "./publish-refused-dialog.copy";
import type { PublishRefusedDialogProps } from "./publish-refused-dialog.types";

function RefusedBody({ failures }: Readonly<Pick<PublishRefusedDialogProps, "failures">>) {
  const t = useTranslations(PUBLISH_REFUSED_DIALOG_COPY_NAMESPACE);
  const names = failures.map((failure) => failure.name ?? t("sourceFallbackName")).join(" · ");
  return (
    <div className="flex flex-col gap-(--space-2) text-(length:--font-size-body)">
      {names === "" ? null : <p className="font-semibold">{names}</p>}
      <p className="text-(--component-input-helper)">{t("publishRefusedHint")}</p>
    </div>
  );
}

/** *Galeri belum bisa dipublikasikan*: names the folders that failed the publish-time check (BR-GAL-004, AC-GAL-017). */
export function PublishRefusedDialog({ failures, onClose }: Readonly<PublishRefusedDialogProps>) {
  const t = useTranslations(PUBLISH_REFUSED_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };
  const body = <RefusedBody failures={failures} />;
  const close = (
    <Button
      variant="secondary"
      size={isMobile ? "lg" : "md"}
      onPress={onClose}
      className="max-md:w-full"
    >
      {t("close")}
    </Button>
  );
  const description = t("publishRefusedNone");
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={handleOpenChange}
        title={t("publishRefusedTitle")}
        description={description}
        variant="actions"
        actions={close}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen
      onOpenChange={handleOpenChange}
      title={t("publishRefusedTitle")}
      description={description}
      size="sm"
      actions={close}
    >
      {body}
    </Modal>
  );
}
