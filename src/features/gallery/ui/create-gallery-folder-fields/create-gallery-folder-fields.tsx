"use client";

import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { CREATE_GALLERY_FOLDER_FIELDS_COPY_NAMESPACE } from "./create-gallery-folder-fields.copy";
import type { CreateGalleryFolderFieldsProps } from "./create-gallery-folder-fields.types";

function FolderLegend() {
  const t = useTranslations(CREATE_GALLERY_FOLDER_FIELDS_COPY_NAMESPACE);
  return (
    <legend className="flex flex-col gap-(--space-1) pb-(--space-3)">
      <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {t("createFolderTitle")}
      </span>
      <span className="text-(length:--font-size-label) text-(--component-input-helper)">
        {t("createFolderHelper")}
      </span>
    </legend>
  );
}

/** The optional first folder of *Buat galeri*: the *Tambah folder* fields and warning (Revision OT #3; Owner 2026-10-07: reuse that flow). */
export function CreateGalleryFolderFields({
  folder,
  sources,
}: Readonly<CreateGalleryFolderFieldsProps>) {
  const t = useTranslations(CREATE_GALLERY_FOLDER_FIELDS_COPY_NAMESPACE);
  const { source, link, label } = folder;
  return (
    <fieldset className="flex flex-col gap-(--space-4)">
      <FolderLegend />
      <Select
        label={t("linkSourceLabel")}
        options={sources.map((option) => ({ id: option.id, label: option.name }))}
        value={source.field.value === "" ? null : source.field.value}
        onChange={source.field.onChange}
        description={t("linkSourceHelper")}
        errorMessage={galleryErrorText(t, source.fieldState.error?.message)}
      />
      <TextField
        label={t("linkLabel")}
        isOptional
        name={link.field.name}
        type="url"
        placeholder={t("linkPlaceholder")}
        value={link.field.value}
        onChange={link.field.onChange}
        onBlur={link.field.onBlur}
        inputRef={link.field.ref}
        description={t("linkHelper")}
        errorMessage={galleryErrorText(t, link.fieldState.error?.message, "link")}
      />
      <TextField
        label={t("labelLabel")}
        isOptional
        name={label.field.name}
        placeholder={t("labelPlaceholder")}
        value={label.field.value}
        onChange={label.field.onChange}
        onBlur={label.field.onBlur}
        description={t("labelHelper")}
        errorMessage={galleryErrorText(t, label.fieldState.error?.message, "label")}
      />
      <Alert tone="warning" title={t("publicLinkTitle")} body={t("publicLinkBody")} />
    </fieldset>
  );
}
