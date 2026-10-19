"use client";

import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";

import type { GalleryExpiryInput } from "@/features/gallery/application/schemas/gallery-expiry/gallery-expiry.types";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import { addDays } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Button } from "@/ui/primitives/button/button";

import { ExpiryFields } from "../expiry-fields/expiry-fields";
import type { ExpiryTranslate } from "../expiry-fields/expiry-fields.types";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { useExpiryForm } from "../use-expiry-form/use-expiry-form";
import { EXPIRY_DIALOG_COPY_NAMESPACE } from "./expiry-dialog.copy";
import type { ExpiryDialogProps } from "./expiry-dialog.types";

const FORM_ID = "gallery-expiry-form";

/** The helper under the duration: the day the gallery closes if it is saved now (AC-GFL-010, design D1). @param t - dialog translator @param value - the current expiry choice @param locale - the formatting locale @returns the helper, or an empty string for a choice that has no duration */
function daysHelperText(
  t: ExpiryTranslate,
  value: GalleryExpiryInput,
  locale: FormattingLocale,
): string {
  if (value.type !== "DAYS") return "";
  const closesOn = formatGalleryDate(addDays(new Date(), value.days).toISOString(), locale);
  return t("expiryDaysHelperLive", { date: closesOn });
}

/** *Kedaluwarsa galeri*: none, a date or a preset duration; a later or no expiry re-opens an expired gallery (BR-GAL-005, AC-GFL-010…012). */
export function ExpiryDialog(props: Readonly<ExpiryDialogProps>) {
  const t = useTranslations(EXPIRY_DIALOG_COPY_NAMESPACE);
  const state = useExpiryForm(props);
  const locale = useFormattingLocale();
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) props.onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      className="max-md:w-full"
    >
      {t("expirySave")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={t("expiryDialogTitle")}
      description={t("expiryDialogBody")}
      size="md"
      isPending={state.isPending}
      renderPrimary={renderPrimary}
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit}>
        <ExpiryFields
          value={state.expiry.value}
          onChange={state.expiry.onChange}
          dateError={state.errors.date}
          daysError={state.errors.days}
          daysHelper={daysHelperText(t, state.expiry.value, locale)}
        />
      </form>
    </GalleryDialogShell>
  );
}
