"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useController, useForm, useWatch } from "react-hook-form";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Alert } from "@/ui/patterns/alert/alert";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { OptionCardGroup } from "@/ui/patterns/option-card/option-card-group";
import type { OptionCardOption } from "@/ui/patterns/option-card/option-card-group.types";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { addSourceSchema } from "../../application/schemas/add-source/add-source.schema";
import { PROVIDER_COPY, SOURCE_COPY } from "../source-copy/source-copy.copy";
import { sourceNameErrorText } from "../source-name-error/source-name-error";
import type { AddSourceDialogProps } from "./add-source-dialog.types";

const FORM_ID = "add-source-form";
const PROVIDER_OPTIONS: readonly OptionCardOption[] = [
  {
    value: "GOOGLE_DRIVE",
    title: PROVIDER_COPY.GOOGLE_DRIVE.title,
    description: PROVIDER_COPY.GOOGLE_DRIVE.description,
    icon: PROVIDER_COPY.GOOGLE_DRIVE.icon,
  },
  {
    value: "DROPBOX",
    title: PROVIDER_COPY.DROPBOX.title,
    icon: PROVIDER_COPY.DROPBOX.icon,
    isDisabled: true,
    badge: SOURCE_COPY.comingSoon,
  },
  {
    value: "ONEDRIVE",
    title: PROVIDER_COPY.ONEDRIVE.title,
    icon: PROVIDER_COPY.ONEDRIVE.icon,
    isDisabled: true,
    badge: SOURCE_COPY.comingSoon,
  },
  {
    value: "AMAZON_S3",
    title: PROVIDER_COPY.AMAZON_S3.title,
    icon: PROVIDER_COPY.AMAZON_S3.icon,
    isDisabled: true,
    badge: SOURCE_COPY.comingSoon,
  },
  {
    value: "CUSTOM_URL",
    title: PROVIDER_COPY.CUSTOM_URL.title,
    icon: PROVIDER_COPY.CUSTOM_URL.icon,
    isDisabled: true,
    badge: SOURCE_COPY.comingSoon,
  },
];

// eslint-disable-next-line max-lines-per-function -- coordinates the shared form and two responsive dialog shells
export function AddSourceDialog({
  isOpen,
  workspaceId,
  onOpenChange,
  action,
}: Readonly<AddSourceDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<{ displayName: string; provider: "GOOGLE_DRIVE" }>({
    resolver: zodResolver(addSourceSchema),
    defaultValues: { displayName: "", provider: "GOOGLE_DRIVE" },
    shouldFocusError: true,
  });
  const { field, fieldState } = useController({ control: form.control, name: "displayName" });
  const provider = useWatch({ control: form.control, name: "provider" });

  async function submit(): Promise<void> {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    setIsPending(true);
    try {
      const result = await action(workspaceId, values);
      if (result?.ok === false) {
        const errorKey = result.fieldErrors.displayName;
        if (errorKey) form.setError("displayName", { type: "server", message: errorKey });
        return;
      }
      showToast({
        tone: "success",
        title: SOURCE_COPY.addedTitle,
        body: SOURCE_COPY.addedBody(values.displayName),
      });
      onOpenChange(false);
    } catch {
      showToast({
        tone: "danger",
        title: SOURCE_COPY.serverErrorTitle,
        body: SOURCE_COPY.serverErrorBody,
        action: { label: SOURCE_COPY.retry, onAction: handleRetry },
      });
    } finally {
      setIsPending(false);
    }
  }

  function handleRetry(): void {
    void submit();
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    void submit();
  }

  function handleProviderChange(value: string): void {
    if (value === "GOOGLE_DRIVE") form.setValue("provider", value);
  }

  function handleCancel(): void {
    onOpenChange(false);
  }

  const formContent = (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <OptionCardGroup
        label={SOURCE_COPY.providerLabel}
        options={PROVIDER_OPTIONS}
        value={provider}
        onChange={handleProviderChange}
        isLabelVisible
      />
      <TextField
        label={SOURCE_COPY.nameLabel}
        name={field.name}
        placeholder={SOURCE_COPY.namePlaceholder}
        description={SOURCE_COPY.nameHelper}
        errorMessage={sourceNameErrorText(fieldState.error?.message ?? "")}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
      <Alert
        tone="warning"
        title={SOURCE_COPY.warningTitle}
        body={SOURCE_COPY.warningBodyShort}
        live={false}
      />
    </form>
  );

  const submitButton = (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className={isMobile ? "w-full" : undefined}
    >
      {isPending ? SOURCE_COPY.adding : SOURCE_COPY.add}
    </Button>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={SOURCE_COPY.addTitle}
        description={SOURCE_COPY.addDescription}
        variant="form"
        actions={submitButton}
      >
        {formContent}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={SOURCE_COPY.addTitle}
      description={SOURCE_COPY.addDescription}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {SOURCE_COPY.cancel}
          </Button>
          {submitButton}
        </>
      }
    >
      {formContent}
    </Modal>
  );
}
