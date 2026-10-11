"use client";

import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { failedBody } from "../delivery-screen/delivery-screen-text";
import { DownloadProgressCard } from "../delivery-screen/delivery-status";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";
import type { PhotosPartProps } from "./photos-actions.types";
import { PHOTOS_STATUS_COPY_NAMESPACE } from "./photos-status.copy";

/** The running download, or the failure alert with *Coba lagi* (F-20, as *Hasil akhir* AC-DEL-005). */
export function PhotosDownloadStatus({ photos }: Readonly<PhotosPartProps>) {
  const t = useTranslations(PHOTOS_STATUS_COPY_NAMESPACE);
  const { progress } = photos.download;
  if (progress.phase === "RUNNING") {
    return <DownloadProgressCard download={photos.download} title={COPY.progressTitle} />;
  }
  if (progress.phase !== "DONE" || photos.failedNames.length === 0) return null;
  return (
    <Alert
      tone="danger"
      live
      title={t("failedTitle", { count: photos.failedNames.length })}
      body={failedBody(t, photos.failedNames)}
      action={{ label: t("retry"), onAction: photos.download.retry }}
    />
  );
}

/** *Unduh semua n foto?* before a download of every proof (F-20, as *Hasil akhir* A-33). */
export function DownloadAllConfirm({ photos }: Readonly<PhotosPartProps>) {
  const t = useTranslations(PHOTOS_STATUS_COPY_NAMESPACE);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) photos.closeConfirm();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      iconLeading="download"
      className="max-md:w-full"
      onPress={photos.downloadAll}
    >
      {t("confirm")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={photos.pendingAll !== null}
      onOpenChange={handleOpenChange}
      title={COPY.confirmTitle(photos.pendingAll?.length ?? 0)}
      description={t("confirmDescription")}
      size="md"
      renderPrimary={renderPrimary}
    >
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {t("confirmBody")}
      </p>
    </GalleryDialogShell>
  );
}
