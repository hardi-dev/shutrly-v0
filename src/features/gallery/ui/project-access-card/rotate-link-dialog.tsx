"use client";

import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { PROJECT_ACCESS_COPY as COPY } from "./project-access-card.copy";
import type { RotateLinkDialogProps } from "./project-access-card.types";

/** *Ganti link galeri?*: warns that every shared link stops working; a standard dialog with a danger button, because the destructive Modal drops its body (aksesklien-dialog-ganti-link, AC-ACC-009). @param props - open state, pending flag and handlers @returns the dialog */
export function RotateLinkDialog({
  isOpen,
  isPending,
  onConfirm,
  onClose,
}: Readonly<RotateLinkDialogProps>) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      variant="danger"
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
      onPress={onConfirm}
    >
      {COPY.rotateLink}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={COPY.dialogTitle}
      description={COPY.dialogDescription}
      size="md"
      isPending={isPending}
      renderPrimary={renderPrimary}
    >
      <div className="flex flex-col gap-(--space-2) text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        <p>{COPY.dialogBody}</p>
        <p>{COPY.dialogNote}</p>
      </div>
    </GalleryDialogShell>
  );
}
