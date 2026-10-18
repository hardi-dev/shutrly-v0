"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { copyShareMessage } from "./copy-share-message";
import { GALLERY_SHARE_DIALOG_COPY_NAMESPACE } from "./gallery-share-dialog.copy";
import type { GalleryShareActionsProps } from "./gallery-share-dialog.types";

/** The dialog footer: *Salin pesan* and *Buka WhatsApp* (disabled without a number), or *Tutup* after a refusal (AC-GFL-022 to 025). @param props - the state and the close handler @returns the footer buttons */
export function GalleryShareActions({ state, onClose }: Readonly<GalleryShareActionsProps>) {
  const t = useTranslations(GALLERY_SHARE_DIALOG_COPY_NAMESPACE);
  if (state.status === "error") {
    return (
      <Button variant="secondary" onPress={onClose}>
        {t("close")}
      </Button>
    );
  }
  const ready = state.status === "ready" ? state.message : null;
  const handleCopy = () => {
    if (ready)
      void copyShareMessage(ready.text, { title: t("copiedTitle"), body: t("copiedBody") });
  };
  return (
    <>
      <Button
        variant="secondary"
        iconLeading="copy"
        isDisabled={ready === null}
        onPress={handleCopy}
      >
        {t("copyMessage")}
      </Button>
      {ready?.waUrl ? (
        <Button variant="primary" iconLeading="message-circle" href={ready.waUrl} target="_blank">
          {t("openWhatsapp")}
        </Button>
      ) : (
        <Button variant="primary" iconLeading="message-circle" isDisabled>
          {t("openWhatsapp")}
        </Button>
      )}
    </>
  );
}
