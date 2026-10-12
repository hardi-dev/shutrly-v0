"use client";

import { useTranslations } from "next-intl";

import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CopyPasswordButton } from "../copy-password-button/copy-password-button";
import { GalleryFacts } from "../gallery-facts/gallery-facts";
import { galleryExpiryFact } from "../gallery-text/gallery-text";
import { ACCESS_CARD_COPY_NAMESPACE } from "./access-card.copy";
import type { AccessCardProps } from "./access-card.types";

/** *Akses klien*: the Owner-visible password with *Salin* and the expiry (AC-GAL-027, ADR-017). */
export function AccessCard({ gallery, action }: Readonly<AccessCardProps>) {
  const t = useTranslations(ACCESS_CARD_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const isMobile = useMobileViewport();
  const expiry = galleryExpiryFact(t, gallery, locale);
  return (
    <SectionCard
      title={t("accessTitle")}
      description={isMobile ? undefined : t("accessDescription")}
      content="flush"
      actions={action}
    >
      <GalleryFacts
        facts={[
          {
            label: t("factPassword"),
            value: (
              <>
                {gallery.password}
                <CopyPasswordButton password={gallery.password} />
              </>
            ),
          },
          { label: t("factExpiry"), value: expiry.text, isMuted: expiry.isMuted },
        ]}
      />
    </SectionCard>
  );
}
