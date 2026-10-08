"use client";

import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { DELIVERY_SCREEN_COPY } from "../delivery-screen/delivery-screen.copy";
import { failedBody } from "../delivery-screen/delivery-screen-text";
import { DownloadProgressCard } from "../delivery-screen/delivery-status";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";
import type { PhotosPartProps } from "./photos-actions.types";

/** The running download, or the failure alert with *Coba lagi* (F-20, as *Hasil akhir* AC-DEL-005). */
export function PhotosDownloadStatus({ photos }: Readonly<PhotosPartProps>) {
  const { progress } = photos.download;
  if (progress.phase === "RUNNING") {
    return <DownloadProgressCard download={photos.download} title={COPY.progressTitle} />;
  }
  if (progress.phase !== "DONE" || photos.failedNames.length === 0) return null;
  return (
    <Alert
      tone="danger"
      live
      title={DELIVERY_SCREEN_COPY.failedTitle(photos.failedNames.length)}
      body={failedBody(photos.failedNames)}
      action={{ label: DELIVERY_SCREEN_COPY.retry, onAction: photos.download.retry }}
    />
  );
}

/** *Unduh semua n foto?* before a download of every proof (F-20, as *Hasil akhir* A-33). */
export function DownloadAllConfirm({ photos }: Readonly<PhotosPartProps>) {
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
      {DELIVERY_SCREEN_COPY.confirm}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={photos.pendingAll !== null}
      onOpenChange={handleOpenChange}
      title={COPY.confirmTitle(photos.pendingAll?.length ?? 0)}
      description={DELIVERY_SCREEN_COPY.confirmDescription}
      size="md"
      renderPrimary={renderPrimary}
    >
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {DELIVERY_SCREEN_COPY.confirmBody}
      </p>
    </GalleryDialogShell>
  );
}
