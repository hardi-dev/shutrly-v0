"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type {
  DeleteClientDialogProps,
  DeleteState,
  DeleteViewProps,
} from "./delete-client-dialog.types";

/** Confirms a destructive client delete before invoking the server action. */
export function DeleteClientDialog({
  client,
  workspaceId,
  onOpenChange,
  action,
}: Readonly<DeleteClientDialogProps>) {
  const mobile = useMobileViewport();
  const [pending, setPending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  if (!client) return null;
  const selected = client;
  async function confirm(): Promise<void> {
    setPending(true);
    try {
      const result = await action(workspaceId, selected.id);
      if (!result.ok) {
        setBlocked(true);
        return;
      }
      showToast({ tone: "success", title: CLIENT_COPY.deletedTitle });
      onOpenChange(false);
    } catch {
      showServerError();
    } finally {
      setPending(false);
    }
  }
  const state: DeleteState = {
    pending,
    blocked,
    title: blocked ? CLIENT_COPY.deleteBlockedTitle : CLIENT_COPY.deleteTitle(selected.name),
    description: blocked
      ? CLIENT_COPY.deleteBlockedBody(selected.name)
      : CLIENT_COPY.deleteDescription,
    close: () => {
      onOpenChange(false);
    },
    confirm: () => {
      void confirm();
    },
  };
  return mobile ? (
    <DeleteClientSheet state={state} onOpenChange={onOpenChange} />
  ) : (
    <DeleteClientModal state={state} onOpenChange={onOpenChange} />
  );
}

function showServerError(): void {
  showToast({
    tone: "danger",
    title: CLIENT_COPY.serverErrorTitle,
    body: CLIENT_COPY.serverErrorBody,
  });
}

function DeleteClientSheet({ state, onOpenChange }: Readonly<DeleteViewProps>) {
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title={state.title}
      description={state.description}
      variant="actions"
    >
      <SheetItem
        label={state.pending ? CLIENT_COPY.deleting : CLIENT_COPY.deleteClient}
        icon="trash-2"
        variant="destructive"
        isPending={state.pending}
        isDisabled={state.blocked}
        onPress={state.confirm}
      />
      <SheetItem label={CLIENT_COPY.cancel} isDisabled={state.pending} onPress={state.close} />
    </BottomSheet>
  );
}

function DeleteClientModal({ state, onOpenChange }: Readonly<DeleteViewProps>) {
  return (
    <Modal
      isOpen
      onOpenChange={onOpenChange}
      title={state.title}
      description={state.description}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={state.close} isDisabled={state.pending}>
            {state.blocked ? CLIENT_COPY.close : CLIENT_COPY.cancel}
          </Button>
          <Button
            variant="danger"
            onPress={state.confirm}
            isDisabled={state.blocked}
            isPending={state.pending}
          >
            {CLIENT_COPY.deleteClient}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
