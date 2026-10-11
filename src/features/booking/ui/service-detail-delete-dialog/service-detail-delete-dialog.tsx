"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { SERVICE_DETAIL_DELETE_DIALOG_COPY_NAMESPACE } from "./service-detail-delete-dialog.copy";
import type { ServiceDetailDeleteDialogProps } from "./service-detail-delete-dialog.types";

export function ServiceDetailDeleteDialog(props: Readonly<ServiceDetailDeleteDialogProps>) {
  const t = useTranslations(SERVICE_DETAIL_DELETE_DIALOG_COPY_NAMESPACE);
  const [isPending, setIsPending] = useState(false);
  async function confirm(): Promise<void> {
    setIsPending(true);
    try {
      await props.onConfirm();
    } finally {
      setIsPending(false);
    }
  }
  function cancel(): void {
    props.onOpenChange(false);
  }
  function handleConfirm(): void {
    void confirm();
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={props.title}
      description={props.description}
      size="sm"
      isDestructive
      actions={
        <>
          <Button variant="secondary" onPress={cancel} isDisabled={isPending}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onPress={handleConfirm} isPending={isPending}>
            {t("delete")}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
