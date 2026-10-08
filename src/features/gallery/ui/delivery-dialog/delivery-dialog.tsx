"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { DELIVERY_COPY as COPY } from "../delivery-copy/delivery.copy";
import { finishedFiles } from "../delivery-text/delivery-text";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import type { DeliveryDialogProps } from "./delivery-dialog.types";

const BODY_CLASS = "text-(length:--font-size-body) text-(--color-semantic-text-secondary)";

/** The *Hasil akhir* dialogs: *Publikasikan hasil akhir?*, *Tandai proyek selesai?* and the refusal with its reasons; a Modal on desktop, a sheet on phones (hasilakhirowner-dialog-*). @param props - the card and its flows @returns the open dialog, or nothing */
export function DeliveryDialog({ card, flows }: Readonly<DeliveryDialogProps>) {
  const { dialog } = flows;
  if (!dialog) return null;
  if (dialog.kind === "REFUSED") return <RefusedDialog {...{ card, flows }} />;
  const isPublish = dialog.kind === "PUBLISH";
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) flows.close();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={flows.isPending}
      className="max-md:w-full"
      onPress={flows.confirm}
    >
      {isPublish ? COPY.publishConfirm : COPY.complete}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={isPublish ? COPY.publishTitle : COPY.completeTitle}
      description={
        isPublish ? COPY.publishDescription : COPY.completeDescription(card.projectTitle)
      }
      size="md"
      isPending={flows.isPending}
      renderPrimary={renderPrimary}
    >
      <p className={BODY_CLASS}>
        {isPublish ? COPY.publishBody(finishedFiles(card)) : COPY.completeBody}
      </p>
    </GalleryDialogShell>
  );
}

function RefusedDialog({ flows }: Readonly<DeliveryDialogProps>) {
  const isMobile = useMobileViewport();
  const reasons = flows.dialog?.kind === "REFUSED" ? flows.dialog.reasons : [];
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) flows.close();
  };
  const body = (
    <div className="flex flex-col gap-(--space-2)">
      {reasons.map((reason) => (
        <p
          key={reason}
          className="text-(length:--font-size-body) text-(--color-semantic-text-primary)"
        >
          {COPY.reason[reason]}
        </p>
      ))}
    </div>
  );
  const confirm = (
    <Button size={isMobile ? "lg" : "md"} className="max-md:w-full" onPress={flows.close}>
      {COPY.refusedConfirm}
    </Button>
  );
  const shared = { isOpen: true, onOpenChange: handleOpenChange, title: COPY.refusedTitle };
  if (isMobile) {
    return (
      <BottomSheet
        {...shared}
        description={COPY.refusedDescription}
        variant="form"
        actions={confirm}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal {...shared} description={COPY.refusedDescription} size="md" actions={confirm}>
      {body}
    </Modal>
  );
}
