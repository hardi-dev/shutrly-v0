"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { PROVIDER_ICON } from "../source-copy/source-copy.copy";
import type { SourceTranslate } from "../source-copy/source-copy.types";
import { sourceNameErrorText } from "../source-name-error/source-name-error";
import { ADD_SOURCE_DIALOG_COPY_NAMESPACE } from "./add-source-dialog.copy";
import type { AddSourceDialogProps } from "./add-source-dialog.types";

const FORM_ID = "add-source-form";

function providerOptions(t: SourceTranslate): readonly OptionCardOption[] {
  const soon = t("comingSoon");
  return [
    {
      value: "GOOGLE_DRIVE",
      title: t("providerGoogleDrive"),
      description: t("providerGoogleDriveDescription"),
      icon: PROVIDER_ICON.GOOGLE_DRIVE,
    },
    {
      value: "DROPBOX",
      title: t("providerDropbox"),
      icon: PROVIDER_ICON.DROPBOX,
      isDisabled: true,
      badge: soon,
    },
    {
      value: "ONEDRIVE",
      title: t("providerOneDrive"),
      icon: PROVIDER_ICON.ONEDRIVE,
      isDisabled: true,
      badge: soon,
    },
    {
      value: "AMAZON_S3",
      title: t("providerAmazonS3"),
      icon: PROVIDER_ICON.AMAZON_S3,
      isDisabled: true,
      badge: soon,
    },
    {
      value: "CUSTOM_URL",
      title: t("providerCustomUrl"),
      icon: PROVIDER_ICON.CUSTOM_URL,
      isDisabled: true,
      badge: soon,
    },
  ];
}

// eslint-disable-next-line max-lines-per-function -- coordinates the shared form and two responsive dialog shells
export function AddSourceDialog({
  isOpen,
  workspaceId,
  onOpenChange,
  action,
}: Readonly<AddSourceDialogProps>) {
  const t = useTranslations(ADD_SOURCE_DIALOG_COPY_NAMESPACE);
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
        title: t("addedTitle"),
        body: t("addedBody", { name: values.displayName }),
      });
      onOpenChange(false);
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        body: t("serverErrorBody"),
        action: { label: t("retry"), onAction: handleRetry },
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
        label={t("providerLabel")}
        options={providerOptions(t)}
        value={provider}
        onChange={handleProviderChange}
        isLabelVisible
      />
      <TextField
        label={t("nameLabel")}
        name={field.name}
        placeholder={t("namePlaceholder")}
        description={t("nameHelper")}
        errorMessage={sourceNameErrorText(t, fieldState.error?.message ?? "")}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
      <Alert tone="warning" title={t("warningTitle")} body={t("warningBodyShort")} live={false} />
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
      {isPending ? t("adding") : t("add")}
    </Button>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={t("addTitle")}
        description={t("addDescription")}
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
      title={t("addTitle")}
      description={t("addDescription")}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {t("cancel")}
          </Button>
          {submitButton}
        </>
      }
    >
      {formContent}
    </Modal>
  );
}
