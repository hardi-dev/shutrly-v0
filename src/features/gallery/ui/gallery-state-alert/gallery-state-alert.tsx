import { useTranslations } from "next-intl";

import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";

import { GALLERY_STATE_ALERT_COPY_NAMESPACE } from "./gallery-state-alert.copy";
import type { GalleryStateAlertProps } from "./gallery-state-alert.types";

/** The page-top Alert of an expired gallery (design `galeri-kedaluwarsa`, AC-GFL-012) or a closed one (design `galeri-ditutup`, AC-GFL-016). @param props - the gallery summary @returns the alert, or null while the gallery is open */
export function GalleryStateAlert({ gallery }: Readonly<GalleryStateAlertProps>) {
  const t = useTranslations(GALLERY_STATE_ALERT_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  if (gallery.state === "EXPIRED" && gallery.expiresAt !== null) {
    return (
      <Alert
        tone="warning"
        title={t("expiredAlertTitle", { date: formatGalleryDate(gallery.expiresAt, locale) })}
        body={t("expiredAlertBody")}
      />
    );
  }
  if (gallery.state === "CLOSED") {
    return <Alert tone="info" title={t("cardClosedTitle")} body={t("cardClosedAlertBody")} />;
  }
  return null;
}
