"use client";

import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import type { GalleryConfirmDialogProps } from "./gallery-confirm-dialog.types";

/** A confirm dialog: Modal SM on desktop, Bottom Sheet/Actions on phones; destructive ones use the danger button (F-06/F-07 pattern). */
export function GalleryConfirmDialog(props: Readonly<GalleryConfirmDialogProps>) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) props.onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      variant={props.isDestructive ? "danger" : "primary"}
      size={isMobile ? "lg" : "md"}
      isPending={props.isPending}
      onPress={props.onConfirm}
      className="max-md:w-full"
    >
      {props.confirmLabel}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={props.title}
      description={props.description}
      size="sm"
      isDestructive={props.isDestructive}
      isPending={props.isPending}
      renderPrimary={renderPrimary}
    >
      {null}
    </GalleryDialogShell>
  );
}
