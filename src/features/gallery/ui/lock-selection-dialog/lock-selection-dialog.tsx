"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { unitOfOwnerGroup } from "../selection-owner-text/selection-owner-text";
import { LOCK_SELECTION_DIALOG_COPY_NAMESPACE } from "./lock-selection-dialog.copy";
import type { LockSelectionDialogProps } from "./lock-selection-dialog.types";

/** The confirm before *Kunci pilihan* (a sent group) or *Tutup pilihan* (an open one): a Modal on desktop, a Bottom Sheet on phones (detailpilihan-dialog-kunci / -tutup, D-13, AC-SEL-011). @param props - the group and intent, the pending flag and handlers @returns the dialog */
export function LockSelectionDialog({
  target,
  isPending,
  onConfirm,
  onClose,
}: Readonly<LockSelectionDialogProps>) {
  const t = useTranslations(LOCK_SELECTION_DIALOG_COPY_NAMESPACE);
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
      {isLock ? t("lockPicks") : t("closePicks")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={isLock ? t("lockTitle", { name: group.name }) : t("closeTitle", { name: group.name })}
      description={isLock ? t("lockDescription") : t("closeDescription")}
      size="md"
      isPending={isPending}
      renderPrimary={renderPrimary}
    >
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {isLock
          ? t("lockBody")
          : t("closeBody", { usage: group.usage, unit: unitOfOwnerGroup(t, group) })}
      </p>
    </GalleryDialogShell>
  );
}
