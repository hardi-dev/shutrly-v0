"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

/** A destructive confirm for removing an item or a session: Modal SM on desktop, an Actions sheet on phones. */
export function ProjectConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const confirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };
  const handleConfirm = () => {
    void confirm();
  };
  const handleCancel = () => {
    onOpenChange(false);
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={body}
        variant="actions"
      >
        <SheetItem
          label={confirmLabel}
          icon="trash-2"
          variant="destructive"
          isPending={isPending}
          onPress={handleConfirm}
        />
        <SheetItem label={PROJECT_COPY.itemCancel} icon="x" onPress={handleCancel} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={body}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {PROJECT_COPY.itemCancel}
          </Button>
          <Button variant="danger" isPending={isPending} onPress={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */
