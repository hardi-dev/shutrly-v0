"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";

import { catalogNameSchema } from "@/features/booking/application/schemas/catalog-name/catalog-name.schema";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { CATEGORY_DIALOG_COPY_NAMESPACE } from "./category-dialog.copy";
import type {
  CategoryDialogController,
  CategoryDialogFormProps,
  CategoryDialogFormValues,
  CategoryDialogProps,
  ResponsiveCategoryDialogProps,
} from "./category-dialog.types";

const FORM_ID = "catalog-category-form";

export function CategoryDialog(props: Readonly<CategoryDialogProps>) {
  const t = useTranslations(CATEGORY_DIALOG_COPY_NAMESPACE);
  const { form, isPending, handleSubmit } = useCategoryDialogForm(props);
  const title = props.category ? t("categoryDialogRenameTitle") : t("categoryDialogAddTitle");
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
  const t = useTranslations(CATEGORY_DIALOG_COPY_NAMESPACE);
  const form = useForm<CategoryDialogFormValues>({
    resolver: zodResolver(catalogNameSchema),
    defaultValues: { name: props.category?.name ?? "" },
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    if (props.isOpen) {
      form.reset({ name: props.category?.name ?? "" });
    }
  }, [form, props.category?.name, props.isOpen]);

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
      showToast({ tone: "success", title: t("savedToast") });
    } catch {
      showCatalogSaveFailure({
        setError: (message) => {
          form.setError("name", { type: "server", message });
        },
        retry: () => {
          void submit();
        },
        t,
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
  const t = useTranslations(CATEGORY_DIALOG_COPY_NAMESPACE);
  return (
    <Button
      type="submit"
      form={FORM_ID}
      isPending={isPending}
      size={useMobileViewport() ? "lg" : "md"}
    >
      {t("save")}
    </Button>
  );
}

function CategoryDialogForm({ form, onSubmit }: Readonly<CategoryDialogFormProps>) {
  const t = useTranslations(CATEGORY_DIALOG_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control: form.control, name: "name" });
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={t("nameCategory")}
        name={field.name}
        placeholder={t("nameCategoryPlaceholder")}
        description={t("categoryDialogDescription")}
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
  const t = useTranslations(CATEGORY_DIALOG_COPY_NAMESPACE);
  if (mobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={t("categoryDialogDescription")}
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
      description={t("categoryDialogDescription")}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={cancel} isDisabled={isPending}>
            {t("cancel")}
          </Button>
          {save}
        </>
      }
    >
      {content}
    </Modal>
  );
}
