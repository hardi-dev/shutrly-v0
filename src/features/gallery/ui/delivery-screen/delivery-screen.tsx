"use client";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientPhotoViewer } from "../client-photo-viewer/client-photo-viewer";
import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { useDeliveryScreen } from "../use-delivery-screen/use-delivery-screen";
import type { DeliveryScreenState } from "../use-delivery-screen/use-delivery-screen.types";
import { DeliveryDownloadMenu } from "./delivery-download-menu";
import { DeliveryFilesCard } from "./delivery-files-card";
import { DELIVERY_SCREEN_COPY as COPY } from "./delivery-screen.copy";
import type { DeliveryPartProps, DeliveryScreenProps } from "./delivery-screen.types";
import { viewerMeta } from "./delivery-screen-text";
import { DeliveryStatus } from "./delivery-status";

function SelectingActions({ screen }: Readonly<DeliveryPartProps>) {
  const count = screen.selectedIds.size;
  return (
    <div className="flex gap-(--space-2) max-md:w-full">
      <Button variant="secondary" className="max-md:flex-1" onPress={screen.stopSelecting}>
        {COPY.cancel}
      </Button>
      <Button
        iconLeading="download"
        className="max-md:flex-1"
        isDisabled={count === 0}
        onPress={screen.downloadSelected}
      >
        {COPY.downloadSelected(count)}
      </Button>
    </div>
  );
}

// Phones: the Mobile Header has no action slot, so the page actions open the content (*Aksi halaman*).
function PhoneActions({ screen }: Readonly<DeliveryPartProps>) {
  if (!screen.isSelecting) return <DeliveryDownloadMenu screen={screen} />;
  return (
    <div className="flex flex-col gap-(--space-2)">
      <p className="text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary)">
        {COPY.selectedTitle(screen.selectedIds.size)}
      </p>
      <SelectingActions screen={screen} />
    </div>
  );
}

function deliveryHeader(screen: DeliveryScreenState, token: string): ClientPageHeader {
  const home = `/g/${token}`;
  const trail = [{ label: CLIENT_COPY.home, href: home }, { label: COPY.title }];
  const back = { href: home, label: CLIENT_COPY.home };
  if (screen.isSelecting) {
    const title = COPY.selectedTitle(screen.selectedIds.size);
    return { title, breadcrumbs: trail, back, action: <SelectingActions screen={screen} /> };
  }
  return {
    title: COPY.title,
    subtitle: COPY.subtitle,
    breadcrumbs: trail,
    back,
    action: <DeliveryDownloadMenu screen={screen} />,
  };
}

function DownloadAllConfirm({ screen }: Readonly<DeliveryPartProps>) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) screen.closeConfirm();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      iconLeading="download"
      className="max-md:w-full"
      onPress={screen.downloadAll}
    >
      {COPY.confirm}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={screen.isConfirmOpen}
      onOpenChange={handleOpenChange}
      title={COPY.confirmTitle(screen.shown.length)}
      description={COPY.confirmDescription}
      size="md"
      renderPrimary={renderPrimary}
    >
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {COPY.confirmBody}
      </p>
    </GalleryDialogShell>
  );
}

function DeliveryViewer({ screen }: Readonly<DeliveryPartProps>) {
  const isMobile = useMobileViewport();
  const close = () => {
    screen.setViewerIndex(null);
  };
  const fileOf = (id: string) => screen.shown.find((file) => file.id === id);
  const renderActions = (photo: ClientPhotoView) => (
    <Button iconLeading="download" href={fileOf(photo.id)?.downloadUrl}>
      {COPY.downloadPhoto}
    </Button>
  );
  const metaOf = (photo: ClientPhotoView) =>
    viewerMeta(
      screen.groupName,
      screen.shown.findIndex((file) => file.id === photo.id),
      screen.shown.length,
    );
  return (
    <ClientPhotoViewer
      photos={screen.shown}
      index={screen.viewerIndex}
      onIndexChange={screen.setViewerIndex}
      onClose={close}
      renderActions={isMobile ? undefined : renderActions}
      renderFooter={isMobile ? renderActions : undefined}
      metaOf={metaOf}
    />
  );
}

/** The client's *Hasil akhir*: finished files by kind with downloads of one, several or all, progress, cancel, failures with *Coba lagi*, and the preview with *Unduh foto* (klien-8 exports, BR-DEL-001…004, A-26, A-33, AC-DEL-003…006). @param props - gate names, token and the files @returns the page */
export function DeliveryScreen({ gate, token, files }: Readonly<DeliveryScreenProps>) {
  const screen = useDeliveryScreen(files);
  const isMobile = useMobileViewport();
  return (
    <ClientShell gate={gate} width="wide" header={deliveryHeader(screen, token)}>
      {isMobile ? <PhoneActions screen={screen} /> : null}
      {screen.isSelecting ? null : <DeliveryStatus screen={screen} />}
      <DeliveryFilesCard screen={screen} />
      <DownloadAllConfirm screen={screen} />
      <DeliveryViewer screen={screen} />
    </ClientShell>
  );
}
