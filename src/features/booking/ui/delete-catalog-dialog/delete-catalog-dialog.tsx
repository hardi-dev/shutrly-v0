"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { DeleteCatalogDialogProps } from "./delete-catalog-dialog.types";

// eslint-disable-next-line max-lines-per-function -- coordinates destructive confirmation and archive fallback
export function DeleteCatalogDialog({
  isOpen,
  workspaceId,
  kind,
  entry,
  isInUse,
  usage,
  onOpenChange,
  removeAction,
  setActiveAction,
}: Readonly<DeleteCatalogDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(): Promise<void> {
    setIsPending(true);
    try {
      if (isInUse) {
        await setActiveAction(workspaceId, kind, entry.id, false);
        onOpenChange(false);
        return;
      }
      const result = await removeAction(workspaceId, kind, entry.id);
      if (!result.ok) return;
      showToast({ tone: "success", title: CATALOG_COPY.deletedToast });
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleCancel(): void {
    onOpenChange(false);
  }

  function handleActionPress(): void {
    void handleDelete();
  }

  const title = CATALOG_COPY.deleteTitle(entry.name);
  const actionLabel = isInUse ? CATALOG_COPY.archive : CATALOG_COPY.deleteConfirm;
  let description: string = CATALOG_COPY.deleteAllowedBody;
  if (isInUse) description = CATALOG_COPY.deleteBlockedBody(entry.name);
  else if (usage) description = `${description} ${usage}`;

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={isInUse ? CATALOG_COPY.deleteBlockedTitle : title}
        description={description}
        variant="actions"
      >
        <SheetItem
          label={actionLabel}
          icon={isInUse ? "archive" : "trash-2"}
          variant="destructive"
          onPress={handleActionPress}
        />
        <SheetItem label={CATALOG_COPY.cancel} onPress={handleCancel} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isInUse ? CATALOG_COPY.deleteBlockedTitle : title}
      description={description}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {CATALOG_COPY.cancel}
          </Button>
          <Button variant="danger" onPress={handleActionPress} isPending={isPending}>
            {actionLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
