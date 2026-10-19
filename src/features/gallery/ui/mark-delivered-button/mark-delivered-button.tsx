"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { MARK_DELIVERED_BUTTON_COPY_NAMESPACE } from "./mark-delivered-button.copy";
import type {
  MarkDeliveredButtonProps,
  MarkDeliveredDialogProps,
} from "./mark-delivered-button.types";
import { useMarkDelivered } from "./use-mark-delivered";

const BODY_CLASS = "text-(length:--font-size-body) text-(--color-semantic-text-secondary)";
const HINT_CLASS = "text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)";

/** The project header's *Tandai terkirim* on POST_PROCESSING: disabled with a hint until a finished file is synced, then a confirm (AC-GFL-017, design `proyek-pascaproduksi`). @param props - ids, the delivery card and the server action @returns the button, its hint and the confirm dialog */
export function MarkDeliveredButton(props: Readonly<MarkDeliveredButtonProps>) {
  const t = useTranslations(MARK_DELIVERED_BUTTON_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const flow = useMarkDelivered(props);
  const hasFinished = props.card.editedCount + props.card.printCount > 0;
  return (
    <>
      <Button
        size={isMobile ? "lg" : "md"}
        iconLeading="circle-check-big"
        className="max-md:w-full"
        isDisabled={!hasFinished}
        onPress={flow.open}
      >
        {t("complete")}
      </Button>
      {hasFinished ? null : <p className={HINT_CLASS}>{t("completeDisabledHint")}</p>}
      {flow.isOpen ? (
        <MarkDeliveredDialog
          title={props.card.projectTitle}
          isPending={flow.isPending}
          onClose={flow.close}
          onConfirm={flow.confirm}
        />
      ) : null}
    </>
  );
}

/** The *Tandai terkirim* confirm: the title, the body and the confirm button, with the flow's pending state (AC-GFL-017). @param props - the title, pending state and the close and confirm handlers @returns the dialog */
export function MarkDeliveredDialog({
  title,
  isPending,
  onClose,
  onConfirm,
}: Readonly<MarkDeliveredDialogProps>) {
  const t = useTranslations(MARK_DELIVERED_BUTTON_COPY_NAMESPACE);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
      onPress={onConfirm}
    >
      {t("completeConfirm")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={t("completeTitle")}
      description={t("completeDescription", { title })}
      size="md"
      isPending={isPending}
      renderPrimary={renderPrimary}
    >
      <p className={BODY_CLASS}>{t("completeBody")}</p>
    </GalleryDialogShell>
  );
}
