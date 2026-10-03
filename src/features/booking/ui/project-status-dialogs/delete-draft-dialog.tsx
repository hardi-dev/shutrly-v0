"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { DeleteDraftDialogProps } from "./project-status-dialogs.types";

/** Hapus draf “…”?: deletes a draft with its snapshots, then the caller returns to the list (AC-PRJ-023). */
export function DeleteDraftDialog(props: Readonly<DeleteDraftDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const { target } = props;
  if (target === null) return null;
  const confirm = async () => {
    setIsPending(true);
    try {
      const result = await props.deleteAction(props.workspaceId, target.id);
      props.onOpenChange(false);
      if (result.ok) {
        showToast({
          tone: "success",
          title: PROJECT_COPY.toastDeletedTitle,
          body: PROJECT_COPY.toastDeletedBody(result.title),
        });
      }
      props.onDone();
    } finally {
      setIsPending(false);
    }
  };
  const handleConfirm = () => {
    void confirm();
  };
  const handleCancel = () => {
    props.onOpenChange(false);
  };
  const title = PROJECT_COPY.deleteDialogTitle(target.title);
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={props.onOpenChange}
        title={title}
        description={PROJECT_COPY.deleteDialogBody}
        variant="actions"
      >
        <SheetItem
          label={PROJECT_COPY.deleteConfirm}
          icon="trash-2"
          variant="destructive"
          isPending={isPending}
          onPress={handleConfirm}
        />
        <SheetItem label={PROJECT_COPY.deleteCancel} icon="x" onPress={handleCancel} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen
      onOpenChange={props.onOpenChange}
      title={title}
      description={PROJECT_COPY.deleteDialogBody}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {PROJECT_COPY.deleteCancel}
          </Button>
          <Button variant="danger" isPending={isPending} onPress={handleConfirm}>
            {PROJECT_COPY.deleteConfirm}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */
