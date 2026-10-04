"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { ExpiryFields } from "../expiry-fields/expiry-fields";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { galleryErrorText } from "../gallery-error-text/gallery-error-text";
import { useCreateGalleryForm } from "../use-create-gallery-form/use-create-gallery-form";
import type {
  CreateGalleryDialogProps,
  CreateGalleryFormProps,
  PasswordRowProps,
} from "./create-gallery-dialog.types";

const FORM_ID = "create-gallery-form";

/** *Buat galeri*: a generated password with *Buat ulang* and the expiry choice (AC-GAL-001, 002, 018, 019). */
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
      <PasswordRow
        field={field}
        error={state.errors.password}
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
    </form>
  );
}

function PasswordRow({ field, error, isRegenerating, onRegenerate }: Readonly<PasswordRowProps>) {
  return (
    <div className="flex items-end gap-(--space-2)">
      <div className="min-w-0 flex-1">
        <TextField
          label={GALLERY_COPY.passwordLabel}
          name={field.name}
          autoComplete="off"
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          description={GALLERY_COPY.passwordHelper}
          errorMessage={galleryErrorText(error)}
        />
      </div>
      <div className="pb-(--space-6)">
        <IconButton
          icon="refresh-cw"
          aria-label={GALLERY_COPY.regenerate}
          isDisabled={isRegenerating}
          onPress={onRegenerate}
        />
      </div>
    </div>
  );
}
