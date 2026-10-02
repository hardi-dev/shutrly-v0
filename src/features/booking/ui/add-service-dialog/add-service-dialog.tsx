"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import { showCatalogSaveFailure } from "../catalog-save-feedback/catalog-save-feedback";
import { CategoryDialog } from "../category-dialog/category-dialog";
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
    />
  );
  const save = <ServiceSaveButton form={form} />;
  return (
    <>
      <ResponsiveServiceDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onClose={form.close}
        content={content}
        save={save}
        title={service ? CATALOG_COPY.editServiceTitle : CATALOG_COPY.addServiceTitle}
        description={
          service ? CATALOG_COPY.editServiceDescription : CATALOG_COPY.addServiceDescription
        }
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
}: Readonly<{
  readonly categories: AddServiceDialogProps["categories"];
  readonly onAddCategory?: () => void;
  readonly form: ReturnType<typeof useAddServiceForm>;
}>) {
  return <AddServiceFields categories={categories} onAddCategory={onAddCategory} {...form} />;
}

function ServiceSaveButton({
  form,
}: Readonly<{ readonly form: ReturnType<typeof useAddServiceForm> }>) {
  return (
    <Button onPress={form.handleSubmit} isPending={form.isPending}>
      {CATALOG_COPY.save}
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
  const values = useAddServiceValues(service);
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  function close(): void {
    values.reset();
    onOpenChange(false);
    setError(undefined);
  }
  function navigate(path: string): void {
    router.push(path);
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
      push: navigate,
    });
  }
  function handleSubmit(): void {
    void submit();
  }
  return {
    ...values,
    error,
    isPending,
    close,
    handleSubmit,
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
    showToast({ tone: "success", title: CATALOG_COPY.savedToast });
    if (!service && result?.serviceId) push(`/w/${workspaceId}/services/${result.serviceId}`);
  } catch {
    showCatalogSaveFailure({ setError, retry: () => void submitAddService(args) });
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
}: Readonly<AddServiceFieldsProps>) {
  const options = categories
    .filter((category) => category.isActive)
    .map((category) => ({ id: category.id, label: category.name }));
  return (
    <div className="flex flex-col gap-(--space-4)">
      <ServiceNameField name={name} onNameChange={onNameChange} />
      <Select
        label={CATALOG_COPY.category}
        options={options}
        value={categoryId}
        placeholder={CATALOG_COPY.categoryPlaceholder}
        onChange={onCategoryChange}
        errorMessage={
          error === "CATEGORY_REQUIRED" ? CATALOG_COPY.errors.CATEGORY_REQUIRED : undefined
        }
      />
      {onAddCategory ? (
        <Button variant="secondary" iconLeading="plus" onPress={onAddCategory}>
          {CATALOG_COPY.addCategoryInline}
        </Button>
      ) : null}
      <ServicePriceField basePrice={basePrice} onBasePriceChange={onBasePriceChange} />
      <CatalogFieldError errorKey={error} />
    </div>
  );
}

function ServiceNameField({
  name,
  onNameChange,
}: Pick<AddServiceFieldsProps, "name" | "onNameChange">) {
  return (
    <TextField
      label={CATALOG_COPY.nameService}
      name="name"
      onBlur={noop}
      placeholder={CATALOG_COPY.nameServicePlaceholder}
      value={name}
      onChange={onNameChange}
    />
  );
}

function ServicePriceField({
  basePrice,
  onBasePriceChange,
}: Pick<AddServiceFieldsProps, "basePrice" | "onBasePriceChange">) {
  return (
    <TextField
      label={CATALOG_COPY.basePrice}
      name="basePrice"
      onBlur={noop}
      placeholder={CATALOG_COPY.basePricePlaceholder}
      prefix={CATALOG_COPY.currencyPrefix}
      value={basePrice}
      onChange={onBasePriceChange}
      description={CATALOG_COPY.basePriceHelp}
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
