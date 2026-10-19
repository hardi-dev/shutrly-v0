"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";

import { GALLERY_SHARE_DIALOG_COPY_NAMESPACE } from "./gallery-share-dialog.copy";
import type { GalleryShareDialogProps } from "./gallery-share-dialog.types";
import { GalleryShareActions } from "./gallery-share-dialog-actions";
import { GalleryShareBody } from "./gallery-share-dialog-body";
import { useGalleryShare } from "./use-gallery-share";

/** *Kirim link ke klien* (K1, K2, AC-GFL-021 to 025): a Modal on desktop, a Bottom Sheet on phones. The message is loaded on open, never cached. @param props - open state, the project, the loader and *Tambah nomor WhatsApp* @returns the dialog */
export function GalleryShareDialog(props: Readonly<GalleryShareDialogProps>) {
  const t = useTranslations(GALLERY_SHARE_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const state = useGalleryShare({
    isOpen: props.isOpen,
    workspaceId: props.workspaceId,
    projectId: props.projectId,
    loadShare: props.loadShare,
    revision: props.revision ?? 0,
  });
  const handleClose = () => {
    props.onOpenChange(false);
  };
  const body = (
    <GalleryShareBody
      state={state}
      workspaceId={props.workspaceId}
      onAddNumber={props.onAddNumber}
    />
  );
  const actions = <GalleryShareActions state={state} onClose={handleClose} />;
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={t("title")}
        description={t("description")}
        variant="form"
        actions={actions}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={t("title")}
      description={t("description")}
      actions={actions}
    >
      {body}
    </Modal>
  );
}
