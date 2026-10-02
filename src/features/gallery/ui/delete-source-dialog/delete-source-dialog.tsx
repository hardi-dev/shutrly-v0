"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import type { DeleteSourceDialogProps } from "./delete-source-dialog.types";

// eslint-disable-next-line max-lines-per-function -- coordinates destructive confirmation across two responsive surfaces
export function DeleteSourceDialog({
  isOpen,
  workspaceId,
  source,
  onOpenChange,
  action,
}: Readonly<DeleteSourceDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(): Promise<void> {
    setIsPending(true);
    try {
      const result = await action(workspaceId, source.id);
      if (!result.ok) {
        showToast({ tone: "danger", title: SOURCE_COPY.inUse });
        return;
      }
      showToast({
        tone: "success",
        title: SOURCE_COPY.deletedTitle,
        body: SOURCE_COPY.deletedBody(source.displayName),
      });
      onOpenChange(false);
    } catch {
      showToast({
        tone: "danger",
        title: SOURCE_COPY.serverErrorTitle,
        body: SOURCE_COPY.serverErrorBody,
      });
    } finally {
      setIsPending(false);
    }
  }

  function handleCancel(): void {
    onOpenChange(false);
  }

  function handleDeletePress(): void {
    void handleDelete();
  }

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={SOURCE_COPY.deleteTitle(source.displayName)}
        description={SOURCE_COPY.deleteMeta}
        variant="actions"
      >
        <SheetItem
          label={SOURCE_COPY.deleteConfirm}
          icon="trash-2"
          variant="destructive"
          onPress={handleDeletePress}
        />
        <SheetItem label={SOURCE_COPY.cancel} onPress={handleCancel} />
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={SOURCE_COPY.deleteTitle(source.displayName)}
      description={SOURCE_COPY.deleteBody}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {SOURCE_COPY.cancel}
          </Button>
          <Button variant="danger" onPress={handleDeletePress} isPending={isPending}>
            {SOURCE_COPY.deleteConfirm}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
