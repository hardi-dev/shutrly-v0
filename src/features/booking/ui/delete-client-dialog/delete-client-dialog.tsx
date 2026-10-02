"use client";
/* eslint-disable max-len -- destructive confirmation preserves the explicit server action contract */

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { DeleteClientDialogProps } from "./delete-client-dialog.types";

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
      showToast({
        tone: "danger",
        title: CLIENT_COPY.serverErrorTitle,
        body: CLIENT_COPY.serverErrorBody,
      });
    } finally {
      setPending(false);
    }
  }
  function close(): void {
    onOpenChange(false);
  }
  function pressConfirm(): void {
    void confirm();
  }
  const title = blocked ? CLIENT_COPY.deleteBlockedTitle : CLIENT_COPY.deleteTitle(selected.name);
  const description = blocked
    ? CLIENT_COPY.deleteBlockedBody(selected.name)
    : CLIENT_COPY.deleteDescription;
  if (mobile)
    return (
      <BottomSheet
        isOpen
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant="actions"
      >
        <SheetItem
          label={pending ? CLIENT_COPY.deleting : CLIENT_COPY.deleteClient}
          icon="trash-2"
          variant="destructive"
          isPending={pending}
          isDisabled={blocked}
          onPress={pressConfirm}
        />
        <SheetItem label={CLIENT_COPY.cancel} isDisabled={pending} onPress={close} />
      </BottomSheet>
    );
  return (
    <Modal
      isOpen
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={close} isDisabled={pending}>
            {blocked ? CLIENT_COPY.close : CLIENT_COPY.cancel}
          </Button>
          <Button variant="danger" onPress={pressConfirm} isDisabled={blocked} isPending={pending}>
            {CLIENT_COPY.deleteClient}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
/* eslint-enable max-len -- end destructive confirmation contract */
