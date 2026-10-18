import { useTranslations } from "next-intl";

import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";

import { GALLERY_STATE_ALERT_COPY_NAMESPACE } from "./gallery-state-alert.copy";
import type { GalleryStateAlertProps } from "./gallery-state-alert.types";

/** The page-top Alert of an expired or archived gallery (design.md › Gallery page, AC-GAL-020, AC-GAL-022). */
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
    return <Alert tone="info" title={t("archivedAlertTitle")} body={t("archivedAlertBody")} />;
  }
  return null;
}
