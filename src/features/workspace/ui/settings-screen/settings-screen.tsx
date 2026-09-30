"use client";

import type { ReactNode } from "react";
import type { FieldPath } from "react-hook-form";
import { useController } from "react-hook-form";

import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { useSettingsForm } from "../use-settings-form/use-settings-form";
import type { SettingsForm } from "../use-settings-form/use-settings-form.types";
import { workspaceFieldErrorText as errorText } from "../workspace-field-error/workspace-field-error";
import { SETTINGS_COPY as COPY } from "./settings-screen.copy";
import type {
  SettingsControl as Control,
  SettingsFieldProps,
  SettingsScreenProps,
  SettingsValues,
} from "./settings-screen.types";

function ignoreEdit(): void {
  // The currency is read-only (IDR only, BR-CUR-001): there is nothing to update.
}

function showSavedToast(): void {
  showToast({ tone: "success", title: COPY.saved, body: COPY.savedBody });
}

/**
 * Workspace settings v3 (workspace.pen EjWRU / NurYs): three Section Cards in the centered
 * narrow column, field errors on their fields, a retryable server error, and a success toast.
 * @param props - the saved profile and the bound save action
 * @returns the settings form
 */
export function SettingsScreen({ action, profile }: Readonly<SettingsScreenProps>) {
  const settings = useSettingsForm({ profile, action, onSaved: showSavedToast });
  return (
    <form
      noValidate
      onSubmit={settings.onSubmit}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)"
    >
      {settings.hasServerError ? (
        <Alert tone="danger" title={COPY.serverErrorTitle} body={COPY.serverErrorBody} live />
      ) : null}
      <SettingsSections settings={settings} currency={profile.currency} />
      <div className="flex md:justify-end">
        <Button
          type="submit"
          size="lg"
          isDisabled={settings.isSubmitting}
          className="w-full md:w-auto md:px-(--component-button-md-padding-x) md:py-(--component-button-md-padding-y)"
        >
          {settings.isSubmitting ? COPY.saving : COPY.save}
        </Button>
      </div>
    </form>
  );
}

function SettingsSections({
  settings,
  currency,
}: Readonly<{ settings: SettingsForm; currency: string }>) {
  const control = settings.form.control;
  return (
    <>
      <BrandSection control={control} />
      <ContactSection control={control} />
      <InvoiceSection control={control} currency={currency} />
    </>
  );
}

function BrandSection({ control }: Readonly<{ control: Control }>) {
  return (
    <SectionCard title={COPY.brandTitle} description={COPY.brandDescription}>
      <SettingsField control={control} name="name" label={COPY.name} />
      <SettingsField
        control={control}
        name="brandName"
        label={COPY.brandName}
        description={COPY.brandNameHelper}
        isOptional
      />
    </SectionCard>
  );
}

function ContactSection({ control }: Readonly<{ control: Control }>) {
  return (
    <SectionCard title={COPY.contactTitle} description={COPY.contactDescription}>
      <FieldRow>
        <SettingsField
          control={control}
          name="contactEmail"
          label={COPY.email}
          type="email"
          isOptional
        />
        <SettingsField control={control} name="phone" label={COPY.phone} type="tel" isOptional />
      </FieldRow>
      <SettingsAddress control={control} />
    </SectionCard>
  );
}

function InvoiceSection({ control, currency }: Readonly<{ control: Control; currency: string }>) {
  return (
    <SectionCard title={COPY.invoiceTitle} description={COPY.invoiceDescription}>
      <FieldRow>
        <SettingsField
          control={control}
          name="invoicePrefix"
          label={COPY.prefix}
          description={COPY.prefixHelper}
        />
        <TextField
          label={COPY.currency}
          name="currency"
          value={currency === "IDR" ? COPY.currencyValue : currency}
          description={COPY.currencyHelper}
          isDisabled
          onChange={ignoreEdit}
          onBlur={ignoreEdit}
        />
      </FieldRow>
    </SectionCard>
  );
}

function FieldRow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-col gap-(--component-section-card-content-gap) md:flex-row md:items-start md:*:flex-1">
      {children}
    </div>
  );
}

function SettingsField({
  control,
  name,
  ...field
}: Readonly<SettingsFieldProps & { control: Control }>) {
  const { field: bound, fieldState } = useController<SettingsValues, FieldPath<SettingsValues>>({
    control,
    name,
  });
  return (
    <TextField
      {...field}
      name={bound.name}
      value={typeof bound.value === "string" ? bound.value : ""}
      onChange={bound.onChange}
      onBlur={bound.onBlur}
      inputRef={bound.ref}
      errorMessage={errorText(fieldState.error?.message)}
    />
  );
}

function SettingsAddress({ control }: Readonly<{ control: Control }>) {
  const { field: bound, fieldState } = useController<SettingsValues, "address">({
    control,
    name: "address",
  });
  return (
    <Textarea
      label={COPY.address}
      name={bound.name}
      optional
      value={typeof bound.value === "string" ? bound.value : ""}
      onChange={bound.onChange}
      textareaRef={bound.ref}
      errorMessage={errorText(fieldState.error?.message)}
    />
  );
}
