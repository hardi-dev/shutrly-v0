"use client";

import { useController, useWatch } from "react-hook-form";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";
import { addOnFieldError } from "../add-on-text/add-on-text";
import type {
  AddOnDialogActionsProps,
  AddOnDialogProps,
  AddOnFieldsProps,
  AddOnTextInputProps,
} from "./add-on-dialog.types";
import { liveAddOnTotal } from "./add-on-total";
import { useAddOnForm } from "./use-add-on-form";

const FORM_ID = "add-on-form";
const NO_GROUP = "none";

/** *Tambah add-on*: description, target group, quantity and unit price with a live total; a Modal on desktop, a form sheet on phones (addon-dialog-tambah, AC-ADD-001…003, -006). @param props - open state, targets and the create action @returns the dialog */
export function AddOnDialog(props: Readonly<AddOnDialogProps>) {
  const isMobile = useMobileViewport();
  const { form, isPending, handleSubmit } = useAddOnForm(props);
  const save = (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={isPending}
      className="max-md:w-full"
    >
      {COPY.saveDraft}
    </Button>
  );
  const body = (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <AddOnFields control={form.control} targets={props.targets} />
    </form>
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={COPY.formTitle}
        description={COPY.formDescription}
        variant="form"
        actions={save}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={COPY.formTitle}
      description={COPY.formDescription}
      size="md"
      actions={<DesktopActions save={save} isPending={isPending} onCancel={props.onOpenChange} />}
    >
      {body}
    </Modal>
  );
}

function DesktopActions({ save, isPending, onCancel }: Readonly<AddOnDialogActionsProps>) {
  const handleCancel = () => {
    onCancel(false);
  };
  return (
    <>
      <Button variant="secondary" isDisabled={isPending} onPress={handleCancel}>
        {COPY.formCancel}
      </Button>
      {save}
    </>
  );
}

function AddOnFields({ control, targets }: Readonly<AddOnFieldsProps>) {
  return (
    <>
      <TextInput
        control={control}
        name="description"
        label={COPY.descriptionLabel}
        placeholder={COPY.descriptionPlaceholder}
        description={COPY.descriptionHelper}
      />
      <TargetSelect control={control} targets={targets} />
      <div className="flex flex-row items-start gap-(--space-4)">
        <div className="min-w-0 flex-1">
          <TextInput
            control={control}
            name="quantity"
            label={COPY.quantityLabel}
            description={COPY.quantityHelper}
          />
        </div>
        <div className="min-w-0 flex-1">
          <TextInput
            control={control}
            name="unitPrice"
            label={COPY.priceLabel}
            prefix={COPY.pricePrefix}
            description={COPY.priceHelper}
          />
        </div>
      </div>
      <LiveTotal control={control} />
    </>
  );
}

function TextInput({ control, name, ...rest }: Readonly<AddOnTextInputProps>) {
  const { field, fieldState } = useController({ control, name });
  const message = fieldState.error?.message;
  return (
    <TextField
      {...rest}
      name={name}
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      errorMessage={message ? addOnFieldError(name, message) : undefined}
    />
  );
}

function TargetSelect({ control, targets }: Readonly<AddOnFieldsProps>) {
  const { field, fieldState } = useController({ control, name: "selectionGroupId" });
  const options = [
    ...targets.map((group) => ({ id: group.id, label: group.name })),
    { id: NO_GROUP, label: COPY.noGroup },
  ];
  const handleChange = (id: string) => {
    field.onChange(id === NO_GROUP ? "" : id);
  };
  const message = fieldState.error?.message;
  return (
    <Select
      label={COPY.targetLabel}
      name="selectionGroupId"
      options={options}
      value={field.value || NO_GROUP}
      onChange={handleChange}
      description={COPY.targetHelper}
      errorMessage={message ? addOnFieldError("selectionGroupId", message) : undefined}
    />
  );
}

function LiveTotal({ control }: Readonly<Pick<AddOnFieldsProps, "control">>) {
  const [quantity, unitPrice] = useWatch({ control, name: ["quantity", "unitPrice"] });
  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {COPY.totalLabel}
      </span>
      <span className="text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
        {liveAddOnTotal(quantity, unitPrice)}
      </span>
    </div>
  );
}
