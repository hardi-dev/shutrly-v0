"use client";

import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";

import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { FolderMappingFields } from "../folder-mapping-fields/folder-mapping-fields";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useFolderMapping } from "../use-folder-mapping/use-folder-mapping";
import { useRenameFolderForm } from "../use-rename-folder-form/use-rename-folder-form";
import { RENAME_FOLDER_DIALOG_COPY_NAMESPACE } from "./rename-folder-dialog.copy";
import type { EditFolderFormProps, RenameFolderDialogProps } from "./rename-folder-dialog.types";

const FORM_ID = "rename-folder-form";

/** *Edit folder*: the folder's label in this gallery (empty shows the Drive folder name, AC-GAL-037) and which subfolders hold finished files for which package item (F-21). */
export function RenameFolderDialog(props: Readonly<RenameFolderDialogProps>) {
  const t = useTranslations(RENAME_FOLDER_DIALOG_COPY_NAMESPACE);
  const mapping = useFolderMapping({ ...props, sourceId: props.source.id });
  const state = useRenameFolderForm(props, mapping);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) props.onClose();
  };
  const renderSave = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      className="max-md:w-full"
    >
      {state.isPending ? t("saving") : t("save")}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={t("renameDialogTitle")}
      description={t("renameDialogDescription")}
      size="md"
      isPending={state.isPending}
      renderPrimary={renderSave}
    >
      <EditFolderForm state={state} mapping={mapping} {...props} />
    </GalleryDialogShell>
  );
}

function EditFolderForm({ state, mapping, source, packageHref }: Readonly<EditFolderFormProps>) {
  const t = useTranslations(RENAME_FOLDER_DIALOG_COPY_NAMESPACE);
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-5)">
      <TextField
        label={t("labelLabel")}
        isOptional
        name={state.field.name}
        placeholder={source.name ?? t("labelPlaceholder")}
        value={state.field.value}
        onChange={state.field.onChange}
        onBlur={state.field.onBlur}
        inputRef={state.field.ref}
        description={t("labelHelper")}
        errorMessage={galleryErrorText(t, state.error, "label")}
      />
      <FolderMappingFields mapping={mapping} packageHref={packageHref} />
    </form>
  );
}
