"use client";

import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useRotatePasswordForm } from "../use-rotate-password-form/use-rotate-password-form";
import type { RotateFormProps, RotatePasswordDialogProps } from "./rotate-password-dialog.types";

const FORM_ID = "gallery-rotate-form";

function RotateForm({ state, onSubmit, onRegenerate }: Readonly<RotateFormProps>) {
  const { field } = state;
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex items-end gap-(--space-2)">
      <div className="min-w-0 flex-1">
        <TextField
          label={GALLERY_COPY.rotateLabel}
          name={field.name}
          autoComplete="off"
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          description={GALLERY_COPY.rotateHelper}
          errorMessage={galleryErrorText(state.error)}
        />
      </div>
      <div className="pb-(--space-6)">
        <IconButton
          icon="refresh-cw"
          aria-label={GALLERY_COPY.regenerate}
          isDisabled={state.isRegenerating}
          onPress={onRegenerate}
        />
      </div>
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
