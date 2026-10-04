"use client";

import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";

import { ExpiryFields } from "../expiry-fields/expiry-fields";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { useExpiryForm } from "../use-expiry-form/use-expiry-form";
import type { ExpiryDialogProps } from "./expiry-dialog.types";

const FORM_ID = "gallery-expiry-form";

/** *Kedaluwarsa galeri*: none, a date or days; a later or no expiry re-opens an expired gallery (BR-GAL-005, AC-GAL-018…020). */
export function ExpiryDialog(props: Readonly<ExpiryDialogProps>) {
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
      {GALLERY_COPY.expirySave}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={GALLERY_COPY.expiryDialogTitle}
      description={GALLERY_COPY.expiryDialogBody}
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
          daysHelper={
            props.isDraft ? GALLERY_COPY.expiryDaysHelperDraft : GALLERY_COPY.expiryDaysHelperLive
          }
        />
      </form>
    </GalleryDialogShell>
  );
}
