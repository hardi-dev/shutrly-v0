"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { Input } from "@/ui/primitives/input/input";

import { createWorkspaceSchema } from "../../application/use-cases/create-workspace/create-workspace.schema";
import { CREATE_WORKSPACE_COPY } from "./create-workspace-dialog.copy";
import type {
  CreateWorkspaceDialogProps,
  CreateWorkspaceFormProps,
  CreateWorkspaceFormValues,
  CreateWorkspaceNameFieldProps,
} from "./create-workspace-dialog.types";

/** Renders the create-workspace modal form used by the switcher. @param props - dialog state and server action @returns the modal or null */
// eslint-disable-next-line max-lines-per-function -- coordinates the mobile sheet and desktop modal variants
export function CreateWorkspaceDialog({
  isOpen,
  onOpenChange,
  action,
}: Readonly<CreateWorkspaceDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={CREATE_WORKSPACE_COPY.title}
        description={CREATE_WORKSPACE_COPY.description}
        variant="form"
        actions={
          <Button
            type="submit"
            form="create-workspace-form"
            size="lg"
            className="w-full"
            isPending={isPending}
          >
            {CREATE_WORKSPACE_COPY.submit}
          </Button>
        }
      >
        <CreateWorkspaceForm action={action} onPendingChange={setIsPending} />
      </BottomSheet>
    );
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={CREATE_WORKSPACE_COPY.title}
      description={CREATE_WORKSPACE_COPY.description}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {CREATE_WORKSPACE_COPY.cancel}
          </Button>
          <Button type="submit" form="create-workspace-form" isPending={isPending}>
            {CREATE_WORKSPACE_COPY.submit}
          </Button>
        </>
      }
    >
      <CreateWorkspaceForm action={action} onPendingChange={setIsPending} />
    </Modal>
  );
}

function CreateWorkspaceForm({
  action,
  includeSubmit = false,
  isPending = false,
  onPendingChange,
}: Readonly<CreateWorkspaceFormProps>) {
  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
    shouldFocusError: true,
  });

  async function submit(values: CreateWorkspaceFormValues): Promise<void> {
    const formData = new FormData();
    formData.set("name", values.name);
    onPendingChange?.(true);
    try {
      await action(formData);
    } finally {
      onPendingChange?.(false);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    void form.handleSubmit(submit)(event);
  }

  return (
    <form
      id="create-workspace-form"
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-(--space-3)"
    >
      <CreateWorkspaceNameField control={form.control} />
      <p className="text-(length:--font-size-label) leading-[17px] text-(--component-input-helper)">
        {CREATE_WORKSPACE_COPY.helper}
      </p>
      {includeSubmit ? (
        <Button type="submit" isPending={isPending}>
          {CREATE_WORKSPACE_COPY.submit}
        </Button>
      ) : null}
    </form>
  );
}

function CreateWorkspaceNameField({ control }: Readonly<CreateWorkspaceNameFieldProps>) {
  const { field, fieldState } = useController({ control, name: "name" });
  return (
    <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
      {CREATE_WORKSPACE_COPY.label}
      <Input
        name={field.name}
        placeholder={CREATE_WORKSPACE_COPY.placeholder}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        isInvalid={fieldState.invalid}
        aria-describedby={fieldState.error ? "create-workspace-name-error" : undefined}
      />
      {fieldState.error ? (
        <span
          id="create-workspace-name-error"
          role="alert"
          className="text-(length:--font-size-label) font-normal text-(--component-input-error-text)"
        >
          {fieldState.error.message}
        </span>
      ) : null}
    </label>
  );
}
