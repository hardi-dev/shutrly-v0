"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { catalogNameSchema } from "@/features/booking/application/schemas/catalog-name/catalog-name.schema";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import type { CategoryDialogProps } from "./category-dialog.types";

const FORM_ID = "catalog-category-form";

// eslint-disable-next-line max-lines-per-function -- coordinates the shared responsive form shells
export function CategoryDialog({
  isOpen,
  workspaceId,
  category,
  onOpenChange,
  action,
  renameAction,
}: Readonly<CategoryDialogProps>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<{ name: string }>({
    resolver: zodResolver(catalogNameSchema),
    defaultValues: { name: category?.name ?? "" },
    shouldFocusError: true,
  });
  const { field, fieldState } = useController({ control: form.control, name: "name" });

  async function submit(): Promise<void> {
    if (!(await form.trigger())) return;
    const values = { name: form.getValues("name").trim() };
    setIsPending(true);
    try {
      const result =
        category && renameAction
          ? await renameAction(workspaceId, category.id, values)
          : await action(workspaceId, values);
      if (result?.ok === false) {
        const errorKey = result.fieldErrors.name;
        if (errorKey) form.setError("name", { type: "server", message: errorKey });
        return;
      }
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

  const content = (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameCategory}
        name={field.name}
        placeholder={CATALOG_COPY.nameCategoryPlaceholder}
        description={CATALOG_COPY.categoryDialogDescription}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
      <CatalogFieldError errorKey={fieldState.error?.message} />
    </form>
  );
  const save = (
    <Button type="submit" form={FORM_ID} isPending={isPending} size={isMobile ? "lg" : "md"}>
      {CATALOG_COPY.save}
    </Button>
  );
  if (isMobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={
          category ? CATALOG_COPY.categoryDialogRenameTitle : CATALOG_COPY.categoryDialogAddTitle
        }
        description={CATALOG_COPY.categoryDialogDescription}
        variant="form"
        actions={save}
      >
        {content}
      </BottomSheet>
    );
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={
        category ? CATALOG_COPY.categoryDialogRenameTitle : CATALOG_COPY.categoryDialogAddTitle
      }
      description={CATALOG_COPY.categoryDialogDescription}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel} isDisabled={isPending}>
            {CATALOG_COPY.cancel}
          </Button>
          {save}
        </>
      }
    >
      {content}
    </Modal>
  );
}
