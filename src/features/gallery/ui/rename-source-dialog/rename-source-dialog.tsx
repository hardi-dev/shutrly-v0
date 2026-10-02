"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { sourceNameSchema } from "../../application/schemas/source-name/source-name.schema";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { sourceNameErrorText } from "../source-name-error/source-name-error";
import type { RenameSourceDialogProps } from "./rename-source-dialog.types";

const FORM_ID = "rename-source-form";

// eslint-disable-next-line max-lines-per-function -- coordinates the shared form and two responsive dialog shells
export function RenameSourceDialog({
  isOpen,
  workspaceId,
  source,
  onOpenChange,
  action,
}: Readonly<RenameSourceDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<{ displayName: string }>({
    resolver: zodResolver(sourceNameSchema),
    defaultValues: { displayName: source.displayName },
    shouldFocusError: true,
  });
  const { field, fieldState } = useController({ control: form.control, name: "displayName" });

  async function submit(): Promise<void> {
    const valid = await form.trigger();
    if (!valid) return;
    const values = { displayName: form.getValues("displayName").trim() };
    setIsPending(true);
    try {
      const result = await action(workspaceId, source.id, values);
      if (result?.ok === false) {
        const errorKey = result.fieldErrors.displayName;
        if (errorKey) form.setError("displayName", { type: "server", message: errorKey });
        return;
      }
      showToast({
        tone: "success",
        title: SOURCE_COPY.renamedTitle,
        body: SOURCE_COPY.renamedBody(values.displayName),
      });
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    void submit();
  }

  function handleCancel(): void {
    onOpenChange(false);
  }

  const formContent = (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={SOURCE_COPY.nameLabel}
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        errorMessage={sourceNameErrorText(fieldState.error?.message ?? "")}
      />
    </form>
  );
  const submitButton = (
    <Button type="submit" form={FORM_ID} size={isMobile ? "lg" : "md"} isPending={isPending}>
      {isPending ? SOURCE_COPY.saving : SOURCE_COPY.save}
    </Button>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={SOURCE_COPY.renameTitle}
        description={SOURCE_COPY.renameDescription}
        variant="form"
        actions={<div className="w-full">{submitButton}</div>}
      >
        {formContent}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={SOURCE_COPY.renameTitle}
      description={SOURCE_COPY.renameDescription}
      size="sm"
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
