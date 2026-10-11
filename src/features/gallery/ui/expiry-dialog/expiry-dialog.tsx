"use client";

import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";

import { ExpiryFields } from "../expiry-fields/expiry-fields";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { useExpiryForm } from "../use-expiry-form/use-expiry-form";
import { EXPIRY_DIALOG_COPY_NAMESPACE } from "./expiry-dialog.copy";
import type { ExpiryDialogProps } from "./expiry-dialog.types";

const FORM_ID = "gallery-expiry-form";

/** *Kedaluwarsa galeri*: none, a date or days; a later or no expiry re-opens an expired gallery (BR-GAL-005, AC-GAL-018…020). */
export function ExpiryDialog(props: Readonly<ExpiryDialogProps>) {
  const t = useTranslations(EXPIRY_DIALOG_COPY_NAMESPACE);
  const state = useExpiryForm(props);
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
          daysHelper={props.isDraft ? t("expiryDaysHelperDraft") : t("expiryDaysHelperLive")}
        />
      </form>
    </GalleryDialogShell>
  );
}
