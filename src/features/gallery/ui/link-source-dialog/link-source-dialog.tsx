"use client";

import type { SyntheticEvent } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useLinkSourceForm } from "../use-link-source-form/use-link-source-form";
import type {
  FolderInUseDialogProps,
  LinkSourceDialogProps,
  LinkSourceFieldsProps,
} from "./link-source-dialog.types";

const FORM_ID = "link-source-form";

/** *Tambah folder*: an active source, the Drive folder link and a label, with the public-link warning (BR-SRC-004, AC-GAL-005, 009–011). */
export function LinkSourceDialog(props: Readonly<LinkSourceDialogProps>) {
  const state = useLinkSourceForm(props);
  const renderAdd = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      className="max-md:w-full"
    >
      {GALLERY_COPY.addFolder}
    </Button>
  );
  if (state.inUse !== null) return <FolderInUseDialog isOpen={props.isOpen} state={state} />;
  return (
    <GalleryDialogShell
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={GALLERY_COPY.linkDialogTitle}
      description={GALLERY_COPY.linkDialogDescription}
      size="md"
      isPending={state.isPending}
      renderPrimary={renderAdd}
    >
      <LinkSourceFields formId={FORM_ID} state={state} options={props.linkableSources} />
    </GalleryDialogShell>
  );
}

function LinkSourceFields({ formId, state, options }: Readonly<LinkSourceFieldsProps>) {
  const { source, link, label } = state.fields;
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <Select
        label={GALLERY_COPY.linkSourceLabel}
        options={options.map((option) => ({ id: option.id, label: option.name }))}
        value={source.field.value === "" ? null : source.field.value}
        onChange={source.field.onChange}
        description={GALLERY_COPY.linkSourceHelper}
        errorMessage={galleryErrorText(source.fieldState.error?.message)}
      />
      <TextField
        label={GALLERY_COPY.linkLabel}
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
    </form>
  );
}

function FolderInUseDialog({ isOpen, state }: Readonly<FolderInUseDialogProps>) {
  const renderConfirm = (isMobile: boolean) => (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={state.isPending}
      onPress={state.confirmInUse}
      className="max-md:w-full"
    >
      {GALLERY_COPY.folderInUseConfirm}
    </Button>
  );
  const handleOpenChange = (open: boolean) => {
    if (!open) state.cancelInUse();
  };
  return (
    <GalleryDialogShell
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={GALLERY_COPY.folderInUseTitle}
      size="sm"
      isPending={state.isPending}
      renderPrimary={renderConfirm}
    >
      <p className="text-(length:--font-size-body) text-(--component-input-helper)">
        {GALLERY_COPY.folderInUseBody(state.inUse?.projects ?? "")}
      </p>
    </GalleryDialogShell>
  );
}
