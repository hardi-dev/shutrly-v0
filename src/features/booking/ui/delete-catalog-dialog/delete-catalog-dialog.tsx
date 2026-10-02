"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type {
  DeleteCatalogDialogProps,
  DeleteDialogState,
  DeleteDialogSurfaceProps,
} from "./delete-catalog-dialog.types";

export function DeleteCatalogDialog(props: Readonly<DeleteCatalogDialogProps>) {
  const mobile = useMobileViewport();
  const state = useDeleteDialogState(props);
  if (mobile) return <MobileDeleteDialog props={props} state={state} />;
  return <DesktopDeleteDialog props={props} state={state} />;
}

function useDeleteDialogState(props: Readonly<DeleteCatalogDialogProps>): DeleteDialogState {
  const [isPending, setIsPending] = useState(false);
  const { entry, isInUse, usage } = props;
  async function deleteEntry(): Promise<void> {
    setIsPending(true);
    try {
      if (isInUse) {
        await props.setActiveAction(props.workspaceId, props.kind, entry.id, false);
        props.onOpenChange(false);
        return;
      }
      const result = await props.removeAction(props.workspaceId, props.kind, entry.id);
      if (!result.ok) return;
      showToast({ tone: "success", title: CATALOG_COPY.deletedToast });
      props.onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }
  let description: string = CATALOG_COPY.deleteAllowedBody;
  if (isInUse) description = CATALOG_COPY.deleteBlockedBody(entry.name);
  else if (usage) description = `${description} ${usage}`;
  return {
    isPending,
    title: isInUse ? CATALOG_COPY.deleteBlockedTitle : CATALOG_COPY.deleteTitle(entry.name),
    description,
    actionLabel: isInUse ? CATALOG_COPY.archive : CATALOG_COPY.deleteConfirm,
    onAction: () => {
      void deleteEntry();
    },
    onCancel: () => {
      props.onOpenChange(false);
    },
  };
}

function MobileDeleteDialog({ props, state }: Readonly<DeleteDialogSurfaceProps>) {
  return (
    <BottomSheet
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={state.title}
      description={state.description}
      variant="actions"
    >
      <SheetItem
        label={state.actionLabel}
        icon={props.isInUse ? "archive" : "trash-2"}
        variant="destructive"
        onPress={state.onAction}
      />
      <SheetItem label={CATALOG_COPY.cancel} onPress={state.onCancel} />
    </BottomSheet>
  );
}

function DesktopDeleteDialog({ props, state }: Readonly<DeleteDialogSurfaceProps>) {
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={state.title}
      description={state.description}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={state.onCancel} isDisabled={state.isPending}>
            {CATALOG_COPY.cancel}
          </Button>
          <Button variant="danger" onPress={state.onAction} isPending={state.isPending}>
            {state.actionLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
