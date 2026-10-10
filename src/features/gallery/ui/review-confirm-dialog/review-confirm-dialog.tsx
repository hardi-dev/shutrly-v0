"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { REVIEW_COPY as COPY } from "../review-screen/review-screen.copy";
import type { ConfirmBodyProps, ReviewConfirmDialogProps } from "./review-confirm-dialog.types";

function ConfirmBody({ group, usage, remaining }: Readonly<ConfirmBodyProps>) {
  return (
    <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
      {COPY.confirmBody(usage, group.limit, group.unit ?? CLIENT_COPY.defaultUnit, remaining)}
    </p>
  );
}

/** The notice before sending below the limit: *Pilih lagi* or *Kirim n foto*, as a Modal on desktop and a Bottom Sheet on phones (tinjau-konfirmasi-kurang, A-5, AC-SEL-008). @param props - the group, usage, places left and handlers @returns the dialog */
export function ReviewConfirmDialog(props: Readonly<ReviewConfirmDialogProps>) {
  const { group, sendLabel, pickHref, isPending, onConfirm, onClose } = props;
  const isMobile = useMobileViewport();
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };
  const send = (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
      onPress={onConfirm}
    >
      {sendLabel}
    </Button>
  );
  const shared = {
    isOpen: true,
    onOpenChange: handleOpenChange,
    title: COPY.confirmTitle(group.name),
    description: COPY.confirmDescription,
  };
  if (isMobile) {
    return (
      <BottomSheet {...shared} variant="form" actions={send}>
        <ConfirmBody {...props} />
      </BottomSheet>
    );
  }
  const back = (
    <Button variant="secondary" href={pickHref}>
      {COPY.confirmBack}
    </Button>
  );
  return (
    <Modal
      {...shared}
      size="md"
      actions={
        <>
          {back}
          {send}
        </>
      }
    >
      <ConfirmBody {...props} />
    </Modal>
  );
}
