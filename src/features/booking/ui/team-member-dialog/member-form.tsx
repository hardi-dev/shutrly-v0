"use client";

import { useController } from "react-hook-form";

import { MultiSelect } from "@/ui/patterns/multi-select/multi-select";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { teamMemberErrorText } from "../team-field-error/team-field-error";
import type { FieldProps, MemberFormProps, RolesFieldProps } from "./member-form.types";

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
  const { field, fieldState } = useController({ control, name: "name" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={TEAM_COPY.memberName}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={TEAM_COPY.memberNamePlaceholder}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText("name", key) : undefined}
    />
  );
}

function WhatsappField({ control, isPending, numberHolder }: Readonly<FieldProps>) {
  const { field, fieldState } = useController({ control, name: "whatsappNumber" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={TEAM_COPY.memberWhatsapp}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={TEAM_COPY.memberWhatsappPlaceholder}
      description={TEAM_COPY.memberWhatsappHint}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText("whatsappNumber", key, numberHolder) : undefined}
    />
  );
}

function EmailField({ control, isPending }: Readonly<FieldProps>) {
  const { field, fieldState } = useController({ control, name: "email" });
  const key = fieldState.error?.message;
  return (
    <TextField
      label={TEAM_COPY.memberEmail}
      isOptional
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      placeholder={TEAM_COPY.memberEmailPlaceholder}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText("email", key) : undefined}
    />
  );
}

function RolesField({ control, isPending, options, onCreateRole }: Readonly<RolesFieldProps>) {
  const { field, fieldState } = useController({ control, name: "roleIds" });
  const key = fieldState.error?.message;
  return (
    <MultiSelect
      label={TEAM_COPY.memberRoles}
      placeholder={TEAM_COPY.memberRolesPlaceholder}
      description={TEAM_COPY.memberRolesHint}
      groupLabel={TEAM_COPY.memberRolesGroup}
      options={options}
      selectedIds={field.value}
      onChange={field.onChange}
      isDisabled={isPending}
      errorMessage={key ? teamMemberErrorText("roleIds", key) : undefined}
      createAction={{ label: TEAM_COPY.createRole, onPress: onCreateRole }}
    />
  );
}
