"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { DELETE_SOURCE_DIALOG_COPY_NAMESPACE } from "./delete-source-dialog.copy";
import type { DeleteSourceDialogProps } from "./delete-source-dialog.types";

// eslint-disable-next-line max-lines-per-function -- coordinates destructive confirmation across two responsive surfaces
export function DeleteSourceDialog({
  isOpen,
  workspaceId,
  source,
  onOpenChange,
  action,
}: Readonly<DeleteSourceDialogProps>) {
  const t = useTranslations(DELETE_SOURCE_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(): Promise<void> {
    setIsPending(true);
    try {
      const result = await action(workspaceId, source.id);
      if (!result.ok) {
        showToast({ tone: "danger", title: t("inUse") });
        return;
      }
      showToast({
        tone: "success",
        title: t("deletedTitle"),
        body: t("deletedBody", { name: source.displayName }),
      });
      onOpenChange(false);
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        body: t("serverErrorBody"),
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
        title={t("deleteTitle", { name: source.displayName })}
        description={t("deleteBody")}
        variant="actions"
      >
        <SheetItem
          label={t("deleteConfirm")}
          icon="trash-2"
          variant="destructive"
          onPress={handleDeletePress}
        />
        <SheetItem label={t("cancel")} onPress={handleCancel} />
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t("deleteTitle", { name: source.displayName })}
      description={t("deleteBody")}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onPress={handleDeletePress} isPending={isPending}>
            {t("deleteConfirm")}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
