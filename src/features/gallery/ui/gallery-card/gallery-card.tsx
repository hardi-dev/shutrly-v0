"use client";

import { useRouter } from "next/navigation";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CreateGalleryDialog } from "../create-gallery-dialog/create-gallery-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryFacts } from "../gallery-facts/gallery-facts";
import type { GalleryFact } from "../gallery-facts/gallery-facts.types";
import { deliverySummary, selectionSummary } from "../gallery-summary-text/gallery-summary-text";
import type { GallerySummaryRow } from "../gallery-summary-text/gallery-summary-text.types";
import {
  galleryExpiryFact,
  galleryStatusChip,
  photoCountsText,
} from "../gallery-text/gallery-text";
import { useCreateGalleryLauncher } from "../use-create-gallery-launcher/use-create-gallery-launcher";
import type {
  EmptyText,
  GalleryCardProps,
  GallerySummaryFactsProps,
  NoGalleryProps,
} from "./gallery-card.types";
import { GallerySummaryRows } from "./gallery-summary-rows";

/** The project detail's Galeri card (board `ZiJzF`, Owner 7): *Buat galeri*, the draft-project hint, or the gallery facts with the *Pilihan klien* and *Hasil akhir* rows (AC-GAL-001, 003, A-34). */
export function GalleryCard(props: Readonly<GalleryCardProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  const { card, workspaceId } = props;
  const galleryHref = `/w/${workspaceId}/projects/${card.project.id}/gallery`;
  const handleManage = () => {
    router.push(galleryHref);
  };
  if (card.gallery === null) return <NoGallery {...props} galleryHref={galleryHref} />;
  const manageLabel = isMobile ? GALLERY_COPY.manageMobile : GALLERY_COPY.manage;
  return (
    <SectionCard
      title={GALLERY_COPY.cardTitle}
      content="flush"
      actions={
        <Button variant="secondary" iconLeading="arrow-right" onPress={handleManage}>
          {card.gallery.status === "ARCHIVED" ? GALLERY_COPY.view : manageLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-(--space-4) p-(--space-4) md:gap-(--space-5) md:p-(--space-6)">
        <GallerySummaryFacts gallery={card.gallery} isMobile={isMobile} />
        <GallerySummaryRows rows={summaryRows(props, isMobile)} />
      </div>
      {card.gallery.failedSourceCount > 0 ? (
        <div className="px-(--space-4) pb-(--space-4) md:px-(--space-6) md:pb-(--space-6)">
          <Alert
            tone="warning"
            title={GALLERY_COPY.cardFailedTitle(card.gallery.failedSourceCount)}
            body={GALLERY_COPY.cardFailedBody(failedNames(card.gallery.failedSourceNames))}
          />
        </div>
      ) : null}
    </SectionCard>
  );
}

function summaryRows(
  { selection, delivery }: Readonly<GalleryCardProps>,
  isMobile: boolean,
): GallerySummaryRow[] {
  const rows = [
    selection ? selectionSummary(selection, isMobile) : null,
    delivery ? deliverySummary(delivery, isMobile) : null,
  ];
  return rows.filter((row) => row !== null);
}

function failedNames(names: readonly string[]): string {
  return names.map((name) => name || GALLERY_COPY.sourceFallbackName).join(", ");
}

function noGalleryText(card: GalleryCardView): EmptyText {
  if (card.canCreate)
    return { title: GALLERY_COPY.cardEmptyTitle, body: GALLERY_COPY.cardEmptyBody };
  if (card.project.status === "DRAFT") {
    return { title: GALLERY_COPY.cardDraftProjectTitle, body: GALLERY_COPY.cardDraftProjectBody };
  }
  return { title: GALLERY_COPY.cardCancelledTitle, body: GALLERY_COPY.cardCancelledBody };
}

function NoGallery(props: Readonly<NoGalleryProps>) {
  const router = useRouter();
  const { card } = props;
  const launcher = useCreateGalleryLauncher({
    workspaceId: props.workspaceId,
    projectId: card.project.id,
    proposeAction: props.proposeAction,
  });
  // Revision OT #3: a folder linked while creating syncs once the gallery page opens.
  const handleCreated = (_galleryId: string, sourceId: string | null) => {
    launcher.close();
    router.push(sourceId ? `${props.galleryHref}?sync=${sourceId}` : props.galleryHref);
  };
  const text = noGalleryText(card);
  return (
    <SectionCard title={GALLERY_COPY.cardTitle} description={GALLERY_COPY.cardDescription}>
      <EmptyState
        icon="images"
        placement="in-card"
        title={text.title}
        body={text.body}
        action={
          card.canCreate ? (
            <Button
              variant="secondary"
              iconLeading="plus"
              isPending={launcher.isOpening}
              onPress={launcher.handleOpen}
            >
              {GALLERY_COPY.create}
            </Button>
          ) : undefined
        }
      />
      {launcher.initialPassword === null ? null : (
        <CreateGalleryDialog
          isOpen
          onOpenChange={launcher.handleOpenChange}
          workspaceId={props.workspaceId}
          projectId={card.project.id}
          initialPassword={launcher.initialPassword}
          linkableSources={card.linkableSources ?? []}
          createAction={props.createAction}
          proposeAction={props.proposeAction}
          checkFolderAction={props.checkFolderAction}
          onCreated={handleCreated}
        />
      )}
    </SectionCard>
  );
}

function GallerySummaryFacts({ gallery, isMobile }: Readonly<GallerySummaryFactsProps>) {
  const expiry = galleryExpiryFact(gallery);
  const status: GalleryFact = {
    label: GALLERY_COPY.factStatus,
    value: <StatusChip {...galleryStatusChip(gallery.status)} />,
  };
  const photos: GalleryFact = {
    label: GALLERY_COPY.factPhotos,
    value: photoCountsText(gallery.counts),
  };
  if (isMobile) return <GalleryFacts facts={[status, photos]} isFlush />;
  const sources =
    gallery.activeSourceCount === 0
      ? GALLERY_COPY.noSources
      : GALLERY_COPY.sourceCount(gallery.activeSourceCount);
  const facts: GalleryFact[] = [
    status,
    { label: GALLERY_COPY.factSources, value: sources },
    photos,
    { label: GALLERY_COPY.factExpiry, value: expiry.text, isMuted: expiry.isMuted },
  ];
  return <GalleryFacts facts={facts} isFlush />;
}
