"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { PublishRefusedDialogProps } from "./publish-refused-dialog.types";

function RefusedBody({ failures }: Readonly<Pick<PublishRefusedDialogProps, "failures">>) {
  const names = failures
    .map((failure) => failure.name ?? GALLERY_COPY.sourceFallbackName)
    .join(" · ");
  return (
    <div className="flex flex-col gap-(--space-2) text-(length:--font-size-body)">
      {names === "" ? null : <p className="font-semibold">{names}</p>}
      <p className="text-(--component-input-helper)">{GALLERY_COPY.publishRefusedHint}</p>
    </div>
  );
}

/** *Galeri belum bisa dipublikasikan*: names the folders that failed the publish-time check (BR-GAL-004, AC-GAL-017). */
export function PublishRefusedDialog({ failures, onClose }: Readonly<PublishRefusedDialogProps>) {
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
      {GALLERY_COPY.close}
    </Button>
  );
  const description = GALLERY_COPY.publishRefusedNone;
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={handleOpenChange}
        title={GALLERY_COPY.publishRefusedTitle}
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
      title={GALLERY_COPY.publishRefusedTitle}
      description={description}
      size="sm"
      actions={close}
    >
      {body}
    </Modal>
  );
}
