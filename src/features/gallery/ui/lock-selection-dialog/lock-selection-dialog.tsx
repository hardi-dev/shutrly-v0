"use client";

import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { SELECTION_OWNER_COPY as COPY } from "../selection-owner-text/selection-owner.copy";
import { unitOfOwnerGroup } from "../selection-owner-text/selection-owner-text";
import type { LockSelectionDialogProps } from "./lock-selection-dialog.types";

/** The confirm before *Kunci pilihan* (a sent group) or *Tutup pilihan* (an open one): a Modal on desktop, a Bottom Sheet on phones (detailpilihan-dialog-kunci / -tutup, D-13, AC-SEL-011). @param props - the group and intent, the pending flag and handlers @returns the dialog */
export function LockSelectionDialog({
  target,
  isPending,
  onConfirm,
  onClose,
}: Readonly<LockSelectionDialogProps>) {
  const { group, intent } = target;
  const isLock = intent === "LOCK";
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
      onPress={onConfirm}
    >
      {isLock ? COPY.lockPicks : COPY.closePicks}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={isLock ? COPY.lockTitle(group.name) : COPY.closeTitle(group.name)}
      description={isLock ? COPY.lockDescription : COPY.closeDescription}
      size="md"
      isPending={isPending}
      renderPrimary={renderPrimary}
    >
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {isLock ? COPY.lockBody : COPY.closeBody(group.usage, unitOfOwnerGroup(group))}
      </p>
    </GalleryDialogShell>
  );
}
