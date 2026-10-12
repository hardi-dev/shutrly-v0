"use client";

import { useTranslations } from "next-intl";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { ClientPhotoViewer } from "../client-photo-viewer/client-photo-viewer";
import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { useDeliveryScreen } from "../use-delivery-screen/use-delivery-screen";
import type { DeliveryScreenState } from "../use-delivery-screen/use-delivery-screen.types";
import { DeliveryDownloadMenu } from "./delivery-download-menu";
import { DeliveryFilesCard } from "./delivery-files-card";
import { DELIVERY_SCREEN_COPY_NAMESPACE, DELIVERY_SHARED_NAMESPACE } from "./delivery-screen.copy";
import type { DeliveryScreenTranslate } from "./delivery-screen.types";
import type { DeliveryPartProps, DeliveryScreenProps } from "./delivery-screen.types";
import { viewerMeta } from "./delivery-screen-text";
import { DeliveryStatus } from "./delivery-status";

function SelectingActions({ screen }: Readonly<DeliveryPartProps>) {
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
  const count = screen.selectedIds.size;
  return (
    <div className="flex gap-(--space-2) max-md:w-full">
      <Button variant="secondary" className="max-md:flex-1" onPress={screen.stopSelecting}>
        {t("cancel")}
      </Button>
      <Button
        iconLeading="download"
        className="max-md:flex-1"
        isDisabled={count === 0}
        onPress={screen.downloadSelected}
      >
        {t("downloadSelected", { count: count })}
      </Button>
    </div>
  );
}

// Phones: the Mobile Header has no action slot, so the page actions open the content (*Aksi halaman*).
function PhoneActions({ screen }: Readonly<DeliveryPartProps>) {
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
  if (!screen.isSelecting) return <DeliveryDownloadMenu screen={screen} />;
  return (
    <div className="flex flex-col gap-(--space-2)">
      <p className="text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary)">
        {t("selectedTitle", { count: screen.selectedIds.size })}
      </p>
      <SelectingActions screen={screen} />
    </div>
  );
}

function deliveryHeader(
  t: DeliveryScreenTranslate,
  shared: DeliveryScreenTranslate,
  screen: DeliveryScreenState,
  token: string,
): ClientPageHeader {
  const home = `/g/${token}`;
  const trail = [{ label: shared("home"), href: home }, { label: t("title") }];
  const back = { href: home, label: shared("home") };
  if (screen.isSelecting) {
    const title = t("selectedTitle", { count: screen.selectedIds.size });
    return { title, breadcrumbs: trail, back, action: <SelectingActions screen={screen} /> };
  }
  return {
    title: t("title"),
    subtitle: t("subtitle"),
    breadcrumbs: trail,
    back,
    action: <DeliveryDownloadMenu screen={screen} />,
  };
}

function DownloadAllConfirm({ screen }: Readonly<DeliveryPartProps>) {
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
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
      {t("confirm")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={screen.isConfirmOpen}
      onOpenChange={handleOpenChange}
      title={t("confirmTitle", { count: screen.shown.length })}
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

function DeliveryViewer({ screen }: Readonly<DeliveryPartProps>) {
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const close = () => {
    screen.setViewerIndex(null);
  };
  const fileOf = (id: string) => screen.shown.find((file) => file.id === id);
  const renderActions = (photo: ClientPhotoView) => (
    <Button iconLeading="download" href={fileOf(photo.id)?.downloadUrl}>
      {t("downloadPhoto")}
    </Button>
  );
  const metaOf = (photo: ClientPhotoView) =>
    viewerMeta(
      t,
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
  const t = useTranslations(DELIVERY_SCREEN_COPY_NAMESPACE);
  const shared = useTranslations(DELIVERY_SHARED_NAMESPACE);
  const screen = useDeliveryScreen(files);
  const isMobile = useMobileViewport();
  return (
    <ClientShell gate={gate} width="wide" header={deliveryHeader(t, shared, screen, token)}>
      {isMobile ? <PhoneActions screen={screen} /> : null}
      {screen.isSelecting ? null : <DeliveryStatus screen={screen} />}
      <DeliveryFilesCard screen={screen} />
      <DownloadAllConfirm screen={screen} />
      <DeliveryViewer screen={screen} />
    </ClientShell>
  );
}
