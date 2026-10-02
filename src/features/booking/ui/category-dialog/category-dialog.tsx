"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { catalogNameSchema } from "@/features/booking/application/schemas/catalog-name/catalog-name.schema";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import type {
  CategoryDialogController,
  CategoryDialogFormProps,
  CategoryDialogFormValues,
  CategoryDialogProps,
  ResponsiveCategoryDialogProps,
} from "./category-dialog.types";

const FORM_ID = "catalog-category-form";

export function CategoryDialog(props: Readonly<CategoryDialogProps>) {
  const { form, isPending, handleSubmit } = useCategoryDialogForm(props);
  const title = props.category
    ? CATALOG_COPY.categoryDialogRenameTitle
    : CATALOG_COPY.categoryDialogAddTitle;
  const content = <CategoryDialogForm form={form} onSubmit={handleSubmit} />;
  const save = <CategorySaveButton isPending={isPending} />;
  return (
    <ResponsiveCategoryDialog
      {...props}
      title={title}
      content={content}
      save={save}
      isPending={isPending}
    />
  );
}

function useCategoryDialogForm(props: Readonly<CategoryDialogProps>): CategoryDialogController {
  const form = useForm<CategoryDialogFormValues>({
    resolver: zodResolver(catalogNameSchema),
    defaultValues: { name: props.category?.name ?? "" },
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);

  async function submit(): Promise<void> {
    if (!(await form.trigger())) return;
    setIsPending(true);
    try {
      const values = { name: form.getValues("name").trim() };
      const result =
        props.category && props.renameAction
          ? await props.renameAction(props.workspaceId, props.category.id, values)
          : await props.action(props.workspaceId, values);
      if (result?.ok === false) {
        const message = result.fieldErrors.name;
        if (message) form.setError("name", { type: "server", message });
        return;
      }
      props.onOpenChange(false);
      showToast({ tone: "success", title: CATALOG_COPY.savedToast });
    } catch {
      showCatalogSaveFailure({
        setError: (message) => { form.setError("name", { type: "server", message }); },
        retry: () => {
          void submit();
        },
      });
    } finally {
      setIsPending(false);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    void submit();
  }
  return { form, isPending, handleSubmit };
}

function CategorySaveButton({ isPending }: Readonly<{ readonly isPending: boolean }>) {
  return (
    <Button
      type="submit"
      form={FORM_ID}
      isPending={isPending}
      size={useMobileViewport() ? "lg" : "md"}
    >
      {CATALOG_COPY.save}
    </Button>
  );
}

function CategoryDialogForm({ form, onSubmit }: Readonly<CategoryDialogFormProps>) {
  const { field, fieldState } = useController({ control: form.control, name: "name" });
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
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
}

function ResponsiveCategoryDialog({
  isOpen,
  onOpenChange,
  title,
  content,
  save,
  isPending,
}: Readonly<ResponsiveCategoryDialogProps>) {
  const mobile = useMobileViewport();
  if (mobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={CATALOG_COPY.categoryDialogDescription}
        variant="form"
        actions={save}
      >
        {content}
      </BottomSheet>
    );
  }

  function cancel(): void {
    onOpenChange(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={CATALOG_COPY.categoryDialogDescription}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={cancel} isDisabled={isPending}>
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
