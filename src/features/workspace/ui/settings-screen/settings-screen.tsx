"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { type Control, useController, useForm } from "react-hook-form";

import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Input } from "@/ui/primitives/input/input";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { updateWorkspaceProfileSchema } from "../../application/use-cases/update-workspace-profile/update-workspace-profile.schema";
import { SETTINGS_COPY } from "./settings-screen.copy";
import type {
  SettingsFieldControlProps,
  SettingsFormValues,
  SettingsScreenProps,
  SettingsTextareaControlProps,
} from "./settings-screen.types";

/** Renders workspace branding settings with a disabled IDR currency field. @param props - profile values and bound server action @returns the settings form */
export function SettingsScreen({ action, profile }: Readonly<SettingsScreenProps>) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(updateWorkspaceProfileSchema),
    defaultValues: {
      name: profile.name,
      brandName: profile.brandName ?? "",
      contactEmail: profile.contactEmail ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      invoicePrefix: profile.invoicePrefix,
    },
    shouldFocusError: true,
  });

  const submit = async (values: SettingsFormValues) => {
    const formData = new FormData();
    for (const [name, value] of Object.entries(values)) {
      formData.set(name, value);
    }
    await action(formData);
    showToast({ tone: "success", title: SETTINGS_COPY.saved });
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void form.handleSubmit(submit)(event);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4)"
    >
      <h2 className="text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary)">
        {SETTINGS_COPY.title}
      </h2>
      <SettingsFormFields control={form.control} currency={profile.currency} />
      <Button type="submit" isPending={form.formState.isSubmitting}>
        {SETTINGS_COPY.save}
      </Button>
    </form>
  );
}

/** Renders the editable workspace fields and disabled currency field. */
function SettingsFormFields({
  control,
  currency,
}: Readonly<{ control: Control<SettingsFormValues>; currency: string }>) {
  return (
    <>
      <SettingsField control={control} label={SETTINGS_COPY.name} name="name" />
      <SettingsField
        control={control}
        label={SETTINGS_COPY.brandName}
        name="brandName"
        isOptional
      />
      <SettingsField
        control={control}
        label={SETTINGS_COPY.email}
        name="contactEmail"
        type="email"
        isOptional
      />
      <SettingsField control={control} label={SETTINGS_COPY.phone} name="phone" isOptional />
      <SettingsTextarea control={control} />
      <SettingsField
        control={control}
        label={SETTINGS_COPY.prefix}
        name="invoicePrefix"
        description={SETTINGS_COPY.prefixHelper}
      />
      <label className="flex flex-col gap-(--space-2) text-(length:--font-size-label) font-semibold">
        {SETTINGS_COPY.currency}
        <Input value={currency} isDisabled aria-label={SETTINGS_COPY.currency} />
        <p className="text-(length:--font-size-label) text-(--component-input-helper)">
          {SETTINGS_COPY.currencyHelper}
        </p>
      </label>
    </>
  );
}

function SettingsField({
  control,
  label,
  name,
  type = "text",
  isOptional = false,
  description,
}: Readonly<SettingsFieldControlProps>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <TextField
      label={label}
      name={field.name}
      type={type}
      value={typeof field.value === "string" ? field.value : ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      isOptional={isOptional}
      description={description}
      errorMessage={fieldState.error?.message}
    />
  );
}

function SettingsTextarea({ control }: Readonly<SettingsTextareaControlProps>) {
  const { field, fieldState } = useController({ control, name: "address" });
  return (
    <Textarea
      label={SETTINGS_COPY.address}
      optional
      name={field.name}
      value={typeof field.value === "string" ? field.value : ""}
      onChange={field.onChange}
      textareaRef={field.ref}
      errorMessage={fieldState.error?.message}
    />
  );
}
