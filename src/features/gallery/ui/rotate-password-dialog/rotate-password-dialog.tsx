"use client";

import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { PasswordProposalField } from "../password-proposal-field/password-proposal-field";
import { useRotatePasswordForm } from "../use-rotate-password-form/use-rotate-password-form";
import type { RotateFormProps, RotatePasswordDialogProps } from "./rotate-password-dialog.types";

const FORM_ID = "gallery-rotate-form";

function RotateForm({ state, onSubmit, onRegenerate }: Readonly<RotateFormProps>) {
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit}>
      <PasswordProposalField
        label={GALLERY_COPY.rotateLabel}
        description={GALLERY_COPY.rotateHelper}
        field={state.field}
        errorMessage={galleryErrorText(state.error)}
        isRegenerating={state.isRegenerating}
        onRegenerate={onRegenerate}
      />
    </form>
  );
}

/** *Ganti password galeri*: a generated proposal with *Buat ulang*; the old password stops working at once (BR-GAL-003, AC-GAL-021). */
export function RotatePasswordDialog(props: Readonly<RotatePasswordDialogProps>) {
  const state = useRotatePasswordForm(props);
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  const handleRegenerate = () => {
    void state.regenerate();
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
      {GALLERY_COPY.rotatePassword}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={GALLERY_COPY.rotateDialogTitle}
      description={GALLERY_COPY.rotateDialogBody}
      size="md"
      isPending={state.isPending}
      renderPrimary={renderPrimary}
    >
      <RotateForm state={state} onSubmit={handleSubmit} onRegenerate={handleRegenerate} />
    </GalleryDialogShell>
  );
}
