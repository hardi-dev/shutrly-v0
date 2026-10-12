"use client";

import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useLinkSourceForm } from "../use-link-source-form/use-link-source-form";
import { LINK_SOURCE_DIALOG_COPY_NAMESPACE } from "./link-source-dialog.copy";
import type {
  FolderInUseDialogProps,
  LinkSourceDialogProps,
  LinkSourceFieldsProps,
} from "./link-source-dialog.types";

const FORM_ID = "link-source-form";

/** *Tambah folder*: an active source, the Drive folder link and a label, with the public-link warning (BR-SRC-004, AC-GAL-005, 009–011). */
export function LinkSourceDialog(props: Readonly<LinkSourceDialogProps>) {
  const t = useTranslations(LINK_SOURCE_DIALOG_COPY_NAMESPACE);
  const state = useLinkSourceForm(props);
  const renderAdd = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      className="max-md:w-full"
    >
      {t("addFolder")}
    </Button>
  );
  if (state.inUse !== null) return <FolderInUseDialog isOpen={props.isOpen} state={state} />;
  return (
    <GalleryDialogShell
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={t("linkDialogTitle")}
      description={t("linkDialogDescription")}
      size="md"
      isPending={state.isPending}
      renderPrimary={renderAdd}
    >
      <LinkSourceFields formId={FORM_ID} state={state} options={props.linkableSources} />
    </GalleryDialogShell>
  );
}

function LinkSourceFields({ formId, state, options }: Readonly<LinkSourceFieldsProps>) {
  const t = useTranslations(LINK_SOURCE_DIALOG_COPY_NAMESPACE);
  const { source, link, label } = state.fields;
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <Select
        label={t("linkSourceLabel")}
        options={options.map((option) => ({ id: option.id, label: option.name }))}
        value={source.field.value === "" ? null : source.field.value}
        onChange={source.field.onChange}
        description={t("linkSourceHelper")}
        errorMessage={galleryErrorText(t, source.fieldState.error?.message)}
      />
      <TextField
        label={t("linkLabel")}
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
    </form>
  );
}

function FolderInUseDialog({ isOpen, state }: Readonly<FolderInUseDialogProps>) {
  const t = useTranslations(LINK_SOURCE_DIALOG_COPY_NAMESPACE);
  const renderConfirm = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      onPress={state.confirmInUse}
      className="max-md:w-full"
    >
      {t("folderInUseConfirm")}
    </Button>
  );
  const handleOpenChange = (open: boolean) => {
    if (!open) state.cancelInUse();
  };
  return (
    <GalleryDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={t("folderInUseTitle")}
      size="sm"
      isPending={state.isPending}
      renderPrimary={renderConfirm}
    >
      <p className="text-(length:--font-size-body) text-(--component-input-helper)">
        {t("folderInUseBody", { projects: state.inUse?.projects ?? "" })}
      </p>
    </GalleryDialogShell>
  );
}
