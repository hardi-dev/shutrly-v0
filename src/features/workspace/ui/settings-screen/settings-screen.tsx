"use client";

import { useTranslations } from "next-intl";
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
import { useWorkspaceFieldErrorText } from "../workspace-field-error/workspace-field-error";
import { SETTINGS_COPY_NAMESPACE } from "./settings-screen.copy";
import type {
  SettingsControl as Control,
  SettingsFieldProps,
  SettingsScreenProps,
  SettingsTranslate,
  SettingsValues,
} from "./settings-screen.types";

function ignoreEdit(): void {
  // The currency is read-only (IDR only, BR-CUR-001): there is nothing to update.
}

/**
 * Workspace settings v3 (workspace.pen EjWRU / NurYs): three Section Cards in the centered
 * narrow column, field errors on their fields, a retryable server error, and a success toast.
 * @param props - the saved profile and the bound save action
 * @returns the settings form
 */
export function SettingsScreen({ action, profile }: Readonly<SettingsScreenProps>) {
  const t = useTranslations(SETTINGS_COPY_NAMESPACE);
  const settings = useSettingsForm({
    profile,
    action,
    onSaved: () => showToast({ tone: "success", title: t("saved"), body: t("savedBody") }),
  });
  return (
    <form
      noValidate
      onSubmit={settings.onSubmit}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6) md:gap-(--component-panel-app-content-gap)"
    >
      {settings.hasServerError ? (
        <Alert tone="danger" title={t("serverErrorTitle")} body={t("serverErrorBody")} live />
      ) : null}
      <SettingsSections settings={settings} currency={profile.currency} t={t} />
      <div className="flex md:justify-end">
        <Button
          type="submit"
          size="lg"
          isDisabled={settings.isSubmitting}
          className="w-full md:w-auto md:px-(--component-button-md-padding-x) md:py-(--component-button-md-padding-y)"
        >
          {settings.isSubmitting ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function SettingsSections({
  settings,
  currency,
  t,
}: Readonly<{ settings: SettingsForm; currency: string; t: SettingsTranslate }>) {
  const control = settings.form.control;
  return (
    <>
      <BrandSection control={control} t={t} />
      <ContactSection control={control} t={t} />
      <InvoiceSection control={control} currency={currency} t={t} />
    </>
  );
}

function BrandSection({ control, t }: Readonly<{ control: Control; t: SettingsTranslate }>) {
  return (
    <SectionCard title={t("brandTitle")} description={t("brandDescription")}>
      <SettingsField control={control} name="name" label={t("name")} />
      <SettingsField
        control={control}
        name="brandName"
        label={t("brandName")}
        description={t("brandNameHelper")}
        isOptional
      />
    </SectionCard>
  );
}

function ContactSection({ control, t }: Readonly<{ control: Control; t: SettingsTranslate }>) {
  return (
    <SectionCard title={t("contactTitle")} description={t("contactDescription")}>
      <FieldRow>
        <SettingsField
          control={control}
          name="contactEmail"
          label={t("email")}
          type="email"
          isOptional
        />
        <SettingsField control={control} name="phone" label={t("phone")} type="tel" isOptional />
      </FieldRow>
      <SettingsAddress control={control} t={t} />
    </SectionCard>
  );
}

function InvoiceSection({
  control,
  currency,
  t,
}: Readonly<{ control: Control; currency: string; t: SettingsTranslate }>) {
  return (
    <SectionCard title={t("invoiceTitle")} description={t("invoiceDescription")}>
      <FieldRow>
        <SettingsField
          control={control}
          name="invoicePrefix"
          label={t("prefix")}
          description={t("prefixHelper")}
        />
        <TextField
          label={t("currency")}
          name="currency"
          value={currency === "IDR" ? t("currencyValue") : currency}
          description={t("currencyHelper")}
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
  const errorText = useWorkspaceFieldErrorText();
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

function SettingsAddress({ control, t }: Readonly<{ control: Control; t: SettingsTranslate }>) {
  const errorText = useWorkspaceFieldErrorText();
  const { field: bound, fieldState } = useController<SettingsValues, "address">({
    control,
    name: "address",
  });
  return (
    <Textarea
      label={t("address")}
      name={bound.name}
      optional
      value={typeof bound.value === "string" ? bound.value : ""}
      onChange={bound.onChange}
      textareaRef={bound.ref}
      errorMessage={errorText(fieldState.error?.message)}
    />
  );
}
