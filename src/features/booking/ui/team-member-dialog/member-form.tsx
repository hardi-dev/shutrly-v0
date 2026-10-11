"use client";

import { useTranslations } from "next-intl";
import { useController } from "react-hook-form";

import { MultiSelect } from "@/ui/patterns/multi-select/multi-select";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { teamMemberErrorText } from "../team-field-error/team-field-error";
import type { FieldProps, MemberFormProps, RolesFieldProps } from "./member-form.types";
import { TEAM_MEMBER_DIALOG_COPY_NAMESPACE } from "./team-member-dialog.copy";

const FORM_ID = "team-member-form";

/**
 * The member form's four fields: Nama, Nomor WhatsApp, Email and the Peran multi-select.
 * @param props - the form controller and the role-creation handler
 * @returns the form element
 */
export function MemberForm({ controller, onCreateRole }: Readonly<MemberFormProps>) {
  const { form, isPending, numberHolder, options, handleSubmit } = controller;
  const shared = { control: form.control, isPending };
  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <NameField {...shared} />
      <WhatsappField {...shared} numberHolder={numberHolder} />
      <EmailField {...shared} />
      <RolesField {...shared} options={options} onCreateRole={onCreateRole} />
    </form>
  );
}

function NameField({ control, isPending }: Readonly<FieldProps>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control, name: "name" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={t("memberName")}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={t("memberNamePlaceholder")}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText(t, "name", key) : undefined}
    />
  );
}

function WhatsappField({ control, isPending, numberHolder }: Readonly<FieldProps>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control, name: "whatsappNumber" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={t("memberWhatsapp")}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={t("memberWhatsappPlaceholder")}
      description={t("memberWhatsappHint")}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText(t, "whatsappNumber", key, numberHolder) : undefined}
    />
  );
}

function EmailField({ control, isPending }: Readonly<FieldProps>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control, name: "email" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={t("memberEmail")}
      isOptional
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={t("memberEmailPlaceholder")}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText(t, "email", key) : undefined}
    />
  );
}

function RolesField({ control, isPending, options, onCreateRole }: Readonly<RolesFieldProps>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const { field, fieldState } = useController({ control, name: "roleIds" });
  const key = fieldState.error?.message;
  return (
    <MultiSelect
      label={t("memberRoles")}
      placeholder={t("memberRolesPlaceholder")}
      description={t("memberRolesHint")}
      groupLabel={t("memberRolesGroup")}
      options={options}
      selectedIds={field.value}
      onChange={field.onChange}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText(t, "roleIds", key) : undefined}
      createAction={{ label: t("createRole"), onPress: onCreateRole }}
    />
  );
}
