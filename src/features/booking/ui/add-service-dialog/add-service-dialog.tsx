"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogFieldError } from "../catalog-field-error/catalog-field-error";
import type {
  AddServiceDialogProps,
  AddServiceFieldsProps,
  AddServiceSubmitArgs,
  ResponsiveServiceDialogProps,
} from "./add-service-dialog.types";

function noop(): void {}

export function AddServiceDialog({
  isOpen,
  workspaceId,
  categories,
  service,
  onOpenChange,
  action,
  updateAction,
}: Readonly<AddServiceDialogProps>) {
  const form = useAddServiceForm({ workspaceId, service, onOpenChange, action, updateAction });
  const content = <AddServiceFields categories={categories} {...form} />;
  const save = (
    <Button onPress={form.handleSubmit} isPending={form.isPending}>
      {CATALOG_COPY.save}
    </Button>
  );
  return (
    <ResponsiveServiceDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={form.close}
      content={content}
      save={save}
      title={service ? CATALOG_COPY.editServiceTitle : CATALOG_COPY.addServiceTitle}
      description={
        service ? CATALOG_COPY.editServiceDescription : CATALOG_COPY.addServiceDescription
      }
    />
  );
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
  const [name, setName] = useState(service?.name ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(service?.categoryId ?? null);
  const [basePrice, setBasePrice] = useState(service?.basePrice ?? "");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  function close(): void {
    onOpenChange(false);
    setError(undefined);
  }
  function navigate(path: string): void { router.push(path); }
  async function submit(): Promise<void> {
    await submitAddService({
      workspaceId,
      service,
      action,
      updateAction,
      name,
      categoryId,
      basePrice,
      close,
      setError,
      setPending: setIsPending,
      push: navigate,
    });
  }
  function handleSubmit(): void { void submit(); }
  return {
    name,
    onNameChange: setName,
    categoryId,
    onCategoryChange: setCategoryId,
    basePrice,
    onBasePriceChange: setBasePrice,
    error,
    isPending,
    close,
    handleSubmit,
  };
}

async function submitAddService({
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
}: AddServiceSubmitArgs): Promise<void> {
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
    if (!service && result?.serviceId) push(`/w/${workspaceId}/services/${result.serviceId}`);
  } catch {
    setError("SAVE_FAILED");
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
}: Readonly<AddServiceFieldsProps>) {
  const options = categories
    .filter((category) => category.isActive)
    .map((category) => ({ id: category.id, label: category.name }));
  return (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameService}
        name="name"
        onBlur={noop}
        value={name}
        onChange={onNameChange}
      />
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
      <TextField
        label={CATALOG_COPY.basePrice}
        name="basePrice"
        onBlur={noop}
        value={basePrice}
        onChange={onBasePriceChange}
        description={CATALOG_COPY.basePriceHelp}
      />
      <CatalogFieldError errorKey={error} />
    </div>
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
