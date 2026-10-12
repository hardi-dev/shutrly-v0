"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type SyntheticEvent, useId, useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { CategoryDialog } from "../category-dialog/category-dialog";
import { ADD_SERVICE_DIALOG_COPY_NAMESPACE } from "./add-service-dialog.copy";
import type {
  AddServiceDialogProps,
  AddServiceFieldsProps,
  AddServiceSubmitArgs,
  ResponsiveServiceDialogProps,
} from "./add-service-dialog.types";

function noop(): void {}

function createDialogOpenChangeHandler(onOpenChange: (isOpen: boolean) => void, close: () => void) {
  return function handleOpenChange(nextIsOpen: boolean): void {
    if (nextIsOpen) {
      onOpenChange(true);
      return;
    }
    close();
  };
}

export function AddServiceDialog({
  isOpen,
  workspaceId,
  categories,
  service,
  onOpenChange,
  action,
  updateAction,
  addCategoryAction,
}: Readonly<AddServiceDialogProps>) {
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  const formId = useId();
  const form = useAddServiceForm({ workspaceId, service, onOpenChange, action, updateAction });
  const handleOpenChange = createDialogOpenChangeHandler(onOpenChange, form.close);
  const inlineCategory = useInlineCategory({
    categories,
    addCategoryAction,
    onCategoryChange: form.onCategoryChange,
  });
  const content = (
    <ServiceFieldsContent
      categories={inlineCategory.categories}
      onAddCategory={addCategoryAction ? inlineCategory.open : undefined}
      form={form}
      formId={formId}
    />
  );
  const save = <ServiceSaveButton form={form} formId={formId} />;
  return (
    <>
      <ResponsiveServiceDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onClose={form.close}
        content={content}
        save={save}
        title={service ? t("editServiceTitle") : t("addServiceTitle")}
        description={service ? t("editServiceDescription") : t("addServiceDescription")}
      />
      {addCategoryAction ? (
        <InlineCategoryDialog
          isOpen={inlineCategory.isOpen}
          workspaceId={workspaceId}
          onOpenChange={inlineCategory.setIsOpen}
          action={inlineCategory.create}
        />
      ) : null}
    </>
  );
}

function ServiceFieldsContent({
  categories,
  onAddCategory,
  form,
  formId,
}: Readonly<{
  readonly categories: AddServiceDialogProps["categories"];
  readonly onAddCategory?: () => void;
  readonly form: ReturnType<typeof useAddServiceForm>;
  readonly formId: string;
}>) {
  return (
    <AddServiceFields
      categories={categories}
      onAddCategory={onAddCategory}
      {...form}
      formId={formId}
    />
  );
}

function ServiceSaveButton({
  form,
  formId,
}: Readonly<{ readonly form: ReturnType<typeof useAddServiceForm>; readonly formId: string }>) {
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  return (
    <Button type="submit" form={formId} isPending={form.isPending}>
      {t("save")}
    </Button>
  );
}

function InlineCategoryDialog(
  props: Readonly<{
    readonly isOpen: boolean;
    readonly workspaceId: string;
    readonly onOpenChange: (isOpen: boolean) => void;
    readonly action: NonNullable<AddServiceDialogProps["addCategoryAction"]>;
  }>,
) {
  return <CategoryDialog {...props} />;
}

function useInlineCategory({
  categories,
  addCategoryAction,
  onCategoryChange,
}: Readonly<{
  readonly categories: readonly AddServiceDialogProps["categories"][number][];
  readonly addCategoryAction: AddServiceDialogProps["addCategoryAction"];
  readonly onCategoryChange: (value: string) => void;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  async function create(categoryWorkspaceId: string, values: unknown) {
    if (!addCategoryAction) return undefined;
    const result = await addCategoryAction(categoryWorkspaceId, values);
    const name = readCategoryName(values);
    const categoryId = result?.ok ? result.categoryId : undefined;
    if (categoryId && name) {
      setLocalCategories((current) => [
        ...current,
        { id: categoryId, name, isActive: true, serviceCount: 0, archivedServiceCount: 0 },
      ]);
      onCategoryChange(categoryId);
      setIsOpen(false);
    }
    return result;
  }
  function open(): void {
    setIsOpen(true);
  }
  return { categories: localCategories, isOpen, setIsOpen, open, create };
}

function readCategoryName(values: unknown): string | undefined {
  if (typeof values !== "object" || values === null || !("name" in values)) return undefined;
  return typeof values.name === "string" ? values.name.trim() : undefined;
}

function useAddServiceForm({
  workspaceId,
  service,
  onOpenChange,
  action,
  updateAction,
}: Pick<
  AddServiceDialogProps,
  "workspaceId" | "service" | "onOpenChange" | "action" | "updateAction"
>) {
  const router = useRouter();
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  const values = useAddServiceValues(service);
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  function close(): void {
    values.reset();
    onOpenChange(false);
    setError(undefined);
  }
  async function submit(): Promise<void> {
    await submitAddService({
      workspaceId,
      service,
      action,
      updateAction,
      name: values.name,
      categoryId: values.categoryId,
      basePrice: values.basePrice,
      close,
      setError,
      setPending: setIsPending,
      push: (path) => {
        router.push(path);
      },
      t,
    });
  }
  function onFormSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!isPending) void submit();
  }
  return {
    ...values,
    error,
    isPending,
    close,
    onFormSubmit,
  };
}

function useAddServiceValues(service: AddServiceDialogProps["service"]) {
  const initialName = service?.name ?? "";
  const initialCategoryId = service?.categoryId ?? null;
  const initialBasePrice = service?.basePrice ?? "";
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  function reset(): void {
    setName(initialName);
    setCategoryId(initialCategoryId);
    setBasePrice(initialBasePrice);
  }
  return {
    name,
    onNameChange: setName,
    categoryId,
    onCategoryChange: setCategoryId,
    basePrice,
    onBasePriceChange: setBasePrice,
    reset,
  };
}

async function submitAddService(args: AddServiceSubmitArgs): Promise<void> {
  const {
    workspaceId,
    service,
    action,
    updateAction,
    name,
    categoryId,
    basePrice,
    close,
    setError,
    setPending,
    push,
    t,
  } = args;
  setPending(true);
  setError(undefined);
  try {
    const result =
      service && updateAction
        ? await updateAction(workspaceId, service.id, { name, categoryId, basePrice })
        : await action(workspaceId, { name, categoryId, basePrice });
    if (result?.ok === false) {
      setError(
        result.fieldErrors.name ?? result.fieldErrors.categoryId ?? result.fieldErrors.basePrice,
      );
      return;
    }
    close();
    showToast({ tone: "success", title: t("savedToast") });
    if (!service && result?.serviceId) push(`/w/${workspaceId}/services/${result.serviceId}`);
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitAddService(args), t });
  } finally {
    setPending(false);
  }
}

function AddServiceFields({
  categories,
  name,
  onNameChange,
  categoryId,
  onCategoryChange,
  basePrice,
  onBasePriceChange,
  error,
  onAddCategory,
  formId,
  onFormSubmit,
}: Readonly<AddServiceFieldsProps>) {
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  const options = categories
    .filter((category) => category.isActive)
    .map((category) => ({ id: category.id, label: category.name }));
  return (
    <form id={formId} noValidate onSubmit={onFormSubmit} className="flex flex-col gap-(--space-4)">
      <ServiceNameField name={name} onNameChange={onNameChange} />
      <Select
        label={t("category")}
        options={options}
        value={categoryId}
        placeholder={t("categoryPlaceholder")}
        onChange={onCategoryChange}
        errorMessage={error === "CATEGORY_REQUIRED" ? t("errorCategoryRequired") : undefined}
      />
      {onAddCategory ? (
        <Button variant="secondary" iconLeading="plus" onPress={onAddCategory}>
          {t("addCategoryInline")}
        </Button>
      ) : null}
      <ServicePriceField basePrice={basePrice} onBasePriceChange={onBasePriceChange} />
      <CatalogFieldError errorKey={error} />
    </form>
  );
}

function ServiceNameField({
  name,
  onNameChange,
}: Pick<AddServiceFieldsProps, "name" | "onNameChange">) {
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  return (
    <TextField
      label={t("nameService")}
      name="name"
      onBlur={noop}
      placeholder={t("nameServicePlaceholder")}
      value={name}
      onChange={onNameChange}
    />
  );
}

function ServicePriceField({
  basePrice,
  onBasePriceChange,
}: Pick<AddServiceFieldsProps, "basePrice" | "onBasePriceChange">) {
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  return (
    <TextField
      label={t("basePrice")}
      name="basePrice"
      onBlur={noop}
      placeholder={t("basePricePlaceholder")}
      prefix={t("currencyPrefix")}
      value={basePrice}
      onChange={onBasePriceChange}
      description={t("basePriceHelp")}
    />
  );
}

function ResponsiveServiceDialog({
  isOpen,
  onOpenChange,
  onClose,
  content,
  save,
  title,
  description,
}: Readonly<ResponsiveServiceDialogProps>) {
  const mobile = useMobileViewport();
  const t = useTranslations(ADD_SERVICE_DIALOG_COPY_NAMESPACE);
  if (mobile)
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
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
      title={title}
      description={description}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={onClose}>
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
