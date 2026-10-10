"use client";

import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CopyPasswordButton } from "../copy-password-button/copy-password-button";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryFacts } from "../gallery-facts/gallery-facts";
import { galleryExpiryFact } from "../gallery-text/gallery-text";
import type { AccessCardProps } from "./access-card.types";

/** *Akses klien*: the Owner-visible password with *Salin* and the expiry (AC-GAL-027, ADR-017). */
export function AccessCard({ gallery, action }: Readonly<AccessCardProps>) {
  const locale = useFormattingLocale();
  const isMobile = useMobileViewport();
  const expiry = galleryExpiryFact(gallery, locale);
  return (
    <SectionCard
      title={GALLERY_COPY.accessTitle}
      description={isMobile ? undefined : GALLERY_COPY.accessDescription}
      content="flush"
      actions={action}
    >
      <GalleryFacts
        facts={[
          {
            label: GALLERY_COPY.factPassword,
            value: (
              <>
                {gallery.password}
                <CopyPasswordButton password={gallery.password} />
              </>
            ),
          },
          { label: GALLERY_COPY.factExpiry, value: expiry.text, isMuted: expiry.isMuted },
        ]}
      />
    </SectionCard>
  );
}
