"use client";

import type { SyntheticEvent } from "react";
import { useController } from "react-hook-form";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { teamRoleErrorText } from "../team-field-error/team-field-error";
import type { TeamRoleDialogProps } from "./team-role-dialog.types";
import { useTeamRoleForm } from "./use-team-role-form";

const FORM_ID = "team-role-form";

/**
 * Presents the add or rename role form as a desktop modal or a phone form sheet.
 * @param props - the dialog props
 * @returns the dialog
 */
export function TeamRoleDialog(props: Readonly<TeamRoleDialogProps>) {
  const isMobile = useMobileViewport();
  const { form, isPending, handleSubmit } = useTeamRoleForm(props);
  const title = props.role ? TEAM_COPY.roleEditTitle : TEAM_COPY.addRole;
  const field = <RoleNameForm form={form} isPending={isPending} onSubmit={handleSubmit} />;
  const save = (
    <Button type="submit" form={FORM_ID} isPending={isPending} size={isMobile ? "lg" : "md"}>
      {isPending ? TEAM_COPY.saving : TEAM_COPY.save}
    </Button>
  );
  function close(): void {
    props.onOpenChange(false);
  }
  if (isMobile)
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={title}
        description={TEAM_COPY.roleDialogDescription}
        variant="form"
        actions={save}
      >
        {field}
      </BottomSheet>
    );
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={title}
      description={TEAM_COPY.roleDialogDescription}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={close} isDisabled={isPending}>
            {TEAM_COPY.cancel}
          </Button>
          {save}
        </>
      }
    >
      {field}
    </Modal>
  );
}

function RoleNameForm({
  form,
  isPending,
  onSubmit,
}: Readonly<{
  form: ReturnType<typeof useTeamRoleForm>["form"];
  isPending: boolean;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}>) {
  const name = useController({ control: form.control, name: "name" });
  const message = name.fieldState.error?.message;
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit}>
      <TextField
        label={TEAM_COPY.roleName}
        name={name.field.name}
        value={name.field.value}
        onChange={name.field.onChange}
        onBlur={name.field.onBlur}
        inputRef={name.field.ref}
        isDisabled={isPending}
        errorMessage={message ? teamRoleErrorText(message) : undefined}
      />
    </form>
  );
}
