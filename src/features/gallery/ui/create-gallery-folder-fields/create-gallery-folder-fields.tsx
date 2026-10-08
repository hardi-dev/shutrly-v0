"use client";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import type { CreateGalleryFolderFieldsProps } from "./create-gallery-folder-fields.types";

function FolderLegend() {
  return (
    <legend className="flex flex-col gap-(--space-1) pb-(--space-3)">
      <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {GALLERY_COPY.createFolderTitle}
      </span>
      <span className="text-(length:--font-size-label) text-(--component-input-helper)">
        {GALLERY_COPY.createFolderHelper}
      </span>
    </legend>
  );
}

/** The optional first folder of *Buat galeri*: the *Tambah folder* fields and warning (Revision OT #3; Owner 2026-10-07: reuse that flow). */
export function CreateGalleryFolderFields({
  folder,
  sources,
}: Readonly<CreateGalleryFolderFieldsProps>) {
  const { source, link, label } = folder;
  return (
    <fieldset className="flex flex-col gap-(--space-4)">
      <FolderLegend />
      <Select
        label={GALLERY_COPY.linkSourceLabel}
        options={sources.map((option) => ({ id: option.id, label: option.name }))}
        value={source.field.value === "" ? null : source.field.value}
        onChange={source.field.onChange}
        description={GALLERY_COPY.linkSourceHelper}
        errorMessage={galleryErrorText(source.fieldState.error?.message)}
      />
      <TextField
        label={GALLERY_COPY.linkLabel}
        isOptional
        name={link.field.name}
        type="url"
        placeholder={GALLERY_COPY.linkPlaceholder}
        value={link.field.value}
        onChange={link.field.onChange}
        onBlur={link.field.onBlur}
        inputRef={link.field.ref}
        description={GALLERY_COPY.linkHelper}
        errorMessage={galleryErrorText(link.fieldState.error?.message, "link")}
      />
      <TextField
        label={GALLERY_COPY.labelLabel}
        isOptional
        name={label.field.name}
        placeholder={GALLERY_COPY.labelPlaceholder}
        value={label.field.value}
        onChange={label.field.onChange}
        onBlur={label.field.onBlur}
        description={GALLERY_COPY.labelHelper}
        errorMessage={galleryErrorText(label.fieldState.error?.message, "label")}
      />
      <Alert
        tone="warning"
        title={GALLERY_COPY.publicLinkTitle}
        body={GALLERY_COPY.publicLinkBody}
      />
    </fieldset>
  );
}
