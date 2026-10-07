"use client";

import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useRenameFolderForm } from "../use-rename-folder-form/use-rename-folder-form";
import type { RenameFolderDialogProps } from "./rename-folder-dialog.types";

const FORM_ID = "rename-folder-form";

/** *Ganti nama folder*: the folder's label in this gallery; empty shows the Drive folder name (AC-GAL-037). */
export function RenameFolderDialog(props: Readonly<RenameFolderDialogProps>) {
  const state = useRenameFolderForm(props);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) props.onClose();
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  const renderSave = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      className="max-md:w-full"
    >
      {state.isPending ? GALLERY_COPY.saving : GALLERY_COPY.save}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={GALLERY_COPY.renameDialogTitle}
      description={GALLERY_COPY.renameDialogDescription}
      size="sm"
      isPending={state.isPending}
      renderPrimary={renderSave}
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit}>
        <TextField
          label={GALLERY_COPY.labelLabel}
          isOptional
          name={state.field.name}
          placeholder={props.source.name ?? GALLERY_COPY.labelPlaceholder}
          value={state.field.value}
          onChange={state.field.onChange}
          onBlur={state.field.onBlur}
          inputRef={state.field.ref}
          description={GALLERY_COPY.labelHelper}
          errorMessage={galleryErrorText(state.error, "label")}
        />
      </form>
    </GalleryDialogShell>
  );
}
