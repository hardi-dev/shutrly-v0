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
import type {
  AddFolderButtonProps,
  EmptyText,
  GalleryCardProps,
  GallerySummaryFactsProps,
  NoFolderProps,
  NoGalleryProps,
  SummaryTranslators,
} from "./gallery-card.types";
import { GallerySummaryRows } from "./gallery-summary-rows";

/** The project detail's Galeri card (design `kartu-galeri-board`, F-27 P1–P6): the booking hint, the no-folder prompt, or the gallery facts with the *Pilihan klien* and *Hasil akhir* rows (AC-GFL-004, 006, 007, 012, 016). The *Kirim link ke klien* button joins the card with the share dialog (iteration 6). @param props - workspace, the card view and the optional summaries @returns the card */
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
  if (card.gallery === null) return <NoGallery card={card} />;
  if (card.gallery.state === "OPEN" && card.gallery.activeSourceCount === 0) {
    return <NoFolder galleryHref={galleryHref} />;
  }
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
    delivery ? deliverySummary(translators.deliveryT, delivery, locale) : null,
  ];
  return rows.filter((row) => row !== null);
}

function failedNames(t: GalleryTranslate, names: readonly string[]): string {
  return names.map((name) => name || t("sourceFallbackName")).join(", ");
}

/** The card text while there is no gallery: the booking hint on a draft, otherwise the cancelled note (AC-GFL-003, AC-GFL-016). @param t - gallery translator @param card - the card view @returns the title and body */
function noGalleryText(t: GalleryTranslate, card: GalleryCardView): EmptyText {
  if (card.project.status === "DRAFT") {
    return { title: t("cardDraftProjectTitle"), body: t("cardDraftProjectBody") };
  }
  return { title: t("cardCancelledTitle"), body: t("cardCancelledBody") };
}

function NoGallery({ card }: Readonly<NoGalleryProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  const text = noGalleryText(t, card);
  return (
    <SectionCard title={t("cardTitle")} description={t("cardDescription")}>
      <EmptyState icon="images" placement="in-card" title={text.title} body={text.body} />
    </SectionCard>
  );
}

/** The card of an open gallery without a folder: the prompt to add one (design P2, AC-GFL-007). @param props - the gallery page's href @returns the card */
function NoFolder({ galleryHref }: Readonly<NoFolderProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  return (
    <SectionCard title={t("cardTitle")} description={t("cardDescription")}>
      <EmptyState
        icon="images"
        placement="in-card"
        title={t("cardNoFolderTitle")}
        body={t("cardNoFolderBody")}
        action={<AddFolderButton galleryHref={galleryHref} />}
      />
    </SectionCard>
  );
}

function AddFolderButton({ galleryHref }: Readonly<AddFolderButtonProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  const router = useRouter();
  const handleAddFolder = () => {
    router.push(galleryHref);
  };
  return (
    <Button variant="secondary" iconLeading="plus" onPress={handleAddFolder}>
      {t("addFolderCta")}
    </Button>
  );
}

/** The status fact shows only when the gallery is not open: expired or closed (design P5, P6). @param t - gallery translator @param gallery - the summary @returns the status fact, or null for an open gallery */
function statusFact(
  t: GalleryTranslate,
  gallery: GallerySummaryFactsProps["gallery"],
): GalleryFact | null {
  if (gallery.state === "OPEN") return null;
  return { label: t("factStatus"), value: <StatusChip {...galleryStatusChip(t, gallery.state)} /> };
}

function GallerySummaryFacts({ gallery, isMobile }: Readonly<GallerySummaryFactsProps>) {
  const t = useTranslations(GALLERY_CARD_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const status = statusFact(t, gallery);
  const photos: GalleryFact = {
    label: t("factPhotos"),
    value: photoCountsText(t, gallery.counts),
  };
  if (isMobile) return <GalleryFacts facts={[status, photos].filter(isFact)} isFlush />;
  const sources =
    gallery.activeSourceCount === 0
      ? t("noSources")
      : t("sourceCount", { count: gallery.activeSourceCount });
  const facts: GalleryFact[] = [
    status,
    { label: t("factPassword"), value: gallery.password },
    { label: t("factSources"), value: sources },
    photos,
    expiryFact(t, gallery, locale),
  ].filter(isFact);
  return <GalleryFacts facts={facts} isFlush />;
}

/** The expiry fact, hidden once the gallery is closed (design P6 shows no expiry). */
function expiryFact(
  t: GalleryTranslate,
  gallery: GallerySummaryFactsProps["gallery"],
  locale: FormattingLocale,
): GalleryFact | null {
  if (gallery.state === "CLOSED") return null;
  const expiry = galleryExpiryFact(t, gallery, locale);
  return { label: t("factExpiry"), value: expiry.text, isMuted: expiry.isMuted };
}

function isFact(fact: GalleryFact | null): fact is GalleryFact {
  return fact !== null;
}
