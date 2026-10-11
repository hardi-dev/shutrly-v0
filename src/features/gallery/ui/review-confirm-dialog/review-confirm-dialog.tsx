"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { CONFIRM_REVIEW_NAMESPACE, CONFIRM_SHARED_NAMESPACE } from "./review-confirm-dialog.copy";
import type { ConfirmBodyProps, ReviewConfirmDialogProps } from "./review-confirm-dialog.types";

function ConfirmBody({ group, usage, remaining }: Readonly<ConfirmBodyProps>) {
  const t = useTranslations(CONFIRM_REVIEW_NAMESPACE);
  const shared = useTranslations(CONFIRM_SHARED_NAMESPACE);
  return (
    <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
      {t("confirmBody", {
        usage,
        limit: group.limit,
        unit: group.unit ?? shared("defaultUnit"),
        remaining,
      })}
    </p>
  );
}

/** The notice before sending below the limit: *Pilih lagi* or *Kirim n foto*, as a Modal on desktop and a Bottom Sheet on phones (tinjau-konfirmasi-kurang, A-5, AC-SEL-008). @param props - the group, usage, places left and handlers @returns the dialog */
export function ReviewConfirmDialog(props: Readonly<ReviewConfirmDialogProps>) {
  const { group, sendLabel, pickHref, isPending, onConfirm, onClose } = props;
  const t = useTranslations(CONFIRM_REVIEW_NAMESPACE);
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
    title: t("confirmTitle", { name: group.name }),
    description: t("confirmDescription"),
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
      {t("confirmBack")}
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
