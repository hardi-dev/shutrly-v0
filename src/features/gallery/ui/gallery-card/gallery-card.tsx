"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import { GalleryFacts } from "../gallery-facts/gallery-facts";
import type { GalleryFact } from "../gallery-facts/gallery-facts.types";
import { deliverySummary, selectionSummary } from "../gallery-summary-text/gallery-summary-text";
import type { GallerySummaryRow } from "../gallery-summary-text/gallery-summary-text.types";
import {
  galleryExpiryFact,
  galleryStatusChip,
  photoCountsText,
} from "../gallery-text/gallery-text";
import {
  GALLERY_CARD_COPY_NAMESPACE,
  GALLERY_CARD_DELIVERY_NAMESPACE,
  GALLERY_CARD_SELECTION_NAMESPACE,
  GALLERY_CARD_SUMMARY_NAMESPACE,
} from "./gallery-card.copy";
import type { SummaryTranslators } from "./gallery-card.types";
import type {
  EmptyText,
  GalleryCardProps,
  GallerySummaryFactsProps,
  NoGalleryProps,
} from "./gallery-card.types";
import { GallerySummaryRows } from "./gallery-summary-rows";

/** The project detail's Galeri card (board `ZiJzF`, Owner 7): *Buat galeri*, the draft-project hint, or the gallery facts with the *Pilihan klien* and *Hasil akhir* rows (AC-GAL-001, 003, A-34). */
export function GalleryCard(props: Readonly<GalleryCardProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  const summaryT = useTranslations(GALLERY_CARD_SUMMARY_NAMESPACE);
  const selectionT = useTranslations(GALLERY_CARD_SELECTION_NAMESPACE);
  const deliveryT = useTranslations(GALLERY_CARD_DELIVERY_NAMESPACE);
  const locale = useFormattingLocale();
  const router = useRouter();
  const isMobile = useMobileViewport();
  const { card, workspaceId } = props;
  const galleryHref = `/w/${workspaceId}/projects/${card.project.id}/gallery`;
  const handleManage = () => {
    router.push(galleryHref);
  };
  if (card.gallery === null) return <NoGallery {...props} galleryHref={galleryHref} />;
  const manageLabel = isMobile ? t("manageMobile") : t("manage");
  return (
    <SectionCard
      title={t("cardTitle")}
      content="flush"
      actions={
        <Button variant="secondary" iconLeading="arrow-right" onPress={handleManage}>
          {card.gallery.state === "CLOSED" ? t("view") : manageLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-(--space-4) p-(--space-4) md:gap-(--space-5) md:p-(--space-6)">
        <GallerySummaryFacts gallery={card.gallery} isMobile={isMobile} />
        <GallerySummaryRows
          rows={summaryRows(props, { summaryT, selectionT, deliveryT }, isMobile, locale)}
        />
      </div>
      {card.gallery.failedSourceCount > 0 ? (
        <div className="px-(--space-4) pb-(--space-4) md:px-(--space-6) md:pb-(--space-6)">
          <Alert
            tone="warning"
            title={t("cardFailedTitle", { count: card.gallery.failedSourceCount })}
            body={t("cardFailedBody", { names: failedNames(t, card.gallery.failedSourceNames) })}
          />
        </div>
      ) : null}
    </SectionCard>
  );
}

function summaryRows(
  { selection, delivery }: Readonly<GalleryCardProps>,
  translators: SummaryTranslators,
  isMobile: boolean,
  locale: FormattingLocale,
): GallerySummaryRow[] {
  const rows = [
    selection
      ? selectionSummary(translators.summaryT, translators.selectionT, selection, isMobile)
      : null,
    delivery
      ? deliverySummary(translators.summaryT, translators.deliveryT, delivery, isMobile, locale)
      : null,
  ];
  return rows.filter((row) => row !== null);
}

function failedNames(t: GalleryTranslate, names: readonly string[]): string {
  return names.map((name) => name || t("sourceFallbackName")).join(", ");
}

function noGalleryText(t: GalleryTranslate, card: GalleryCardView): EmptyText {
  if (card.canCreate) return { title: t("cardEmptyTitle"), body: t("cardEmptyBody") };
  if (card.project.status === "DRAFT") {
    return { title: t("cardDraftProjectTitle"), body: t("cardDraftProjectBody") };
  }
  return { title: t("cardCancelledTitle"), body: t("cardCancelledBody") };
}

function NoGallery({ card }: Readonly<NoGalleryProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  return (
    <SectionCard title={t("cardTitle")} description={t("cardDescription")}>
      <EmptyState
        icon="images"
        placement="in-card"
        title={noGalleryText(t, card).title}
        body={noGalleryText(t, card).body}
      />
    </SectionCard>
  );
}

function GallerySummaryFacts({ gallery, isMobile }: Readonly<GallerySummaryFactsProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const expiry = galleryExpiryFact(t, gallery, locale);
  const status: GalleryFact = {
    label: t("factStatus"),
    value: <StatusChip {...galleryStatusChip(t, gallery.state)} />,
  };
  const photos: GalleryFact = {
    label: t("factPhotos"),
    value: photoCountsText(t, gallery.counts),
  };
  if (isMobile) return <GalleryFacts facts={[status, photos]} isFlush />;
  const sources =
    gallery.activeSourceCount === 0
      ? t("noSources")
      : t("sourceCount", { count: gallery.activeSourceCount });
  const facts: GalleryFact[] = [
    status,
    { label: t("factSources"), value: sources },
    photos,
    { label: t("factExpiry"), value: expiry.text, isMuted: expiry.isMuted },
  ];
  return <GalleryFacts facts={facts} isFlush />;
}
