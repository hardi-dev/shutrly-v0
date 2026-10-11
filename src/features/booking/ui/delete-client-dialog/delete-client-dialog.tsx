"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import { DELETE_CLIENT_DIALOG_COPY_NAMESPACE } from "./delete-client-dialog.copy";
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
  const t = useTranslations(DELETE_CLIENT_DIALOG_COPY_NAMESPACE);
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
      showToast({ tone: "success", title: t("deletedTitle") });
      onOpenChange(false);
    } catch {
      showServerError(t);
    } finally {
      setPending(false);
    }
  }
  const state: DeleteState = {
    pending,
    blocked,
    title: blocked ? t("deleteBlockedTitle") : t("deleteTitle", { name: selected.name }),
    description: blocked ? t("deleteBlockedBody", { name: selected.name }) : t("deleteDescription"),
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

function showServerError(t: ClientTranslate): void {
  showToast({
    tone: "danger",
    title: t("serverErrorTitle"),
    body: t("serverErrorBody"),
  });
}

function DeleteClientSheet({ state, onOpenChange }: Readonly<DeleteViewProps>) {
  const t = useTranslations(DELETE_CLIENT_DIALOG_COPY_NAMESPACE);
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title={state.title}
      description={state.description}
      variant="actions"
    >
      <SheetItem
        label={state.pending ? t("deleting") : t("deleteClient")}
        icon="trash-2"
        variant="destructive"
        isPending={state.pending}
        isDisabled={state.blocked}
        onPress={state.confirm}
      />
      <SheetItem label={t("cancel")} isDisabled={state.pending} onPress={state.close} />
    </BottomSheet>
  );
}

function DeleteClientModal({ state, onOpenChange }: Readonly<DeleteViewProps>) {
  const t = useTranslations(DELETE_CLIENT_DIALOG_COPY_NAMESPACE);
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
            {state.blocked ? t("close") : t("cancel")}
          </Button>
          <Button
            variant="danger"
            onPress={state.confirm}
            isDisabled={state.blocked}
            isPending={state.pending}
          >
            {t("deleteClient")}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
