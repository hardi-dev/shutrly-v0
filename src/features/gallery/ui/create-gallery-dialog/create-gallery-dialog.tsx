"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/ui/primitives/button/button";

import { CreateGalleryFolderFields } from "../create-gallery-folder-fields/create-gallery-folder-fields";
import { ExpiryFields } from "../expiry-fields/expiry-fields";
import { GalleryConfirmDialog } from "../gallery-confirm-dialog/gallery-confirm-dialog";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { PasswordProposalField } from "../password-proposal-field/password-proposal-field";
import { useCreateGalleryForm } from "../use-create-gallery-form/use-create-gallery-form";
import type {
  CreateGalleryDialogProps,
  CreateGalleryFormProps,
} from "./create-gallery-dialog.types";

const FORM_ID = "create-gallery-form";

/** *Buat galeri*: a generated password with *Buat ulang*, the expiry choice and an optional first folder (AC-GAL-001, 002, 010, 018, 019; Revision OT #3). */
export function CreateGalleryDialog(props: Readonly<CreateGalleryDialogProps>) {
  const [isPending, setIsPending] = useState(false);
  const renderPrimary = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
    >
      {GALLERY_COPY.create}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={GALLERY_COPY.createDialogTitle}
      description={GALLERY_COPY.accessDescription}
      size="md"
      isPending={isPending}
      renderPrimary={renderPrimary}
    >
      <CreateGalleryForm {...props} formId={FORM_ID} onPendingChange={setIsPending} />
    </GalleryDialogShell>
  );
}

function CreateGalleryForm(props: Readonly<CreateGalleryFormProps>) {
  const state = useCreateGalleryForm(props);
  const { onPendingChange } = props;
  useEffect(() => {
    onPendingChange(state.isPending);
  }, [state.isPending, onPendingChange]);
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void state.submit(event);
  };
  const handleRegenerate = () => {
    void state.regenerate();
  };
  const { field } = state.password;
  return (
    <form
      id={props.formId}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-(--space-5)"
    >
      <PasswordProposalField
        label={GALLERY_COPY.passwordLabel}
        description={GALLERY_COPY.passwordHelper}
        field={field}
        errorMessage={galleryErrorText(state.errors.password)}
        isRegenerating={state.isRegenerating}
        onRegenerate={handleRegenerate}
      />
      <ExpiryFields
        value={state.expiry.field.value}
        onChange={state.expiry.field.onChange}
        dateError={state.errors.date}
        daysError={state.errors.days}
        daysHelper={GALLERY_COPY.expiryDaysHelperDraft}
      />
      {props.linkableSources.length > 0 ? (
        <CreateGalleryFolderFields folder={state.folder} sources={props.linkableSources} />
      ) : null}
      <FolderInUseConfirm state={state} />
    </form>
  );
}

/** *Folder sudah dipakai proyek lain* before creating, as after *Tambah folder* (AC-GAL-010). */
function FolderInUseConfirm({
  state,
}: Readonly<{ state: ReturnType<typeof useCreateGalleryForm> }>) {
  if (!state.inUse) return null;
  return (
    <GalleryConfirmDialog
      title={GALLERY_COPY.folderInUseTitle}
      description={GALLERY_COPY.folderInUseBody(state.inUse.projects)}
      confirmLabel={GALLERY_COPY.createFolderInUseConfirm}
      isPending={state.isPending}
      onConfirm={state.confirmInUse}
      onClose={state.cancelInUse}
    />
  );
}
