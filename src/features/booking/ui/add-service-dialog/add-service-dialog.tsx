"use client";
/* eslint-disable max-lines-per-function, no-restricted-syntax -- responsive form shell keeps its fields together */

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
import type { AddServiceDialogProps } from "./add-service-dialog.types";

export function AddServiceDialog({
  isOpen,
  workspaceId,
  categories,
  onOpenChange,
  action,
}: Readonly<AddServiceDialogProps>) {
  const router = useRouter();
  const isMobile = useMobileViewport();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  function close(): void {
    onOpenChange(false);
    setError(undefined);
  }

  async function submit(): Promise<void> {
    setIsPending(true);
    setError(undefined);
    try {
      const result = await action(workspaceId, { name, categoryId, basePrice });
      if (!result.ok) {
        setError(
          result.fieldErrors.name ?? result.fieldErrors.categoryId ?? result.fieldErrors.basePrice,
        );
        return;
      }
      close();
      if (result.serviceId) router.push(`/w/${workspaceId}/services/${result.serviceId}`);
    } catch {
      setError("SAVE_FAILED");
    } finally {
      setIsPending(false);
    }
  }

  const content = (
    <div className="flex flex-col gap-(--space-4)">
      <TextField
        label={CATALOG_COPY.nameService}
        name="name"
        onBlur={() => undefined}
        value={name}
        onChange={setName}
      />
      <Select
        label={CATALOG_COPY.category}
        options={categories
          .filter((category) => category.isActive)
          .map((category) => ({ id: category.id, label: category.name }))}
        value={categoryId}
        placeholder={CATALOG_COPY.categoryPlaceholder}
        onChange={setCategoryId}
        errorMessage={
          error === "CATEGORY_REQUIRED" ? CATALOG_COPY.errors.CATEGORY_REQUIRED : undefined
        }
      />
      <TextField
        label={CATALOG_COPY.basePrice}
        name="basePrice"
        onBlur={() => undefined}
        value={basePrice}
        onChange={setBasePrice}
        description={CATALOG_COPY.basePriceHelp}
      />
      <CatalogFieldError errorKey={error} />
    </div>
  );
  const save = (
    <Button onPress={() => void submit()} isPending={isPending}>
      {CATALOG_COPY.save}
    </Button>
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={CATALOG_COPY.addServiceTitle}
        description={CATALOG_COPY.addServiceDescription}
        variant="form"
        actions={save}
      >
        {content}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={CATALOG_COPY.addServiceTitle}
      description={CATALOG_COPY.addServiceDescription}
      size="sm"
      actions={
        <>
          <Button variant="secondary" onPress={close}>
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
/* eslint-enable max-lines-per-function, no-restricted-syntax -- end responsive form shell */
