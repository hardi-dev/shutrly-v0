"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { teamRoleInputSchema } from "@/features/booking/application/schemas/team-role-input/team-role-input.schema";
import type {
  TeamRoleFields,
  TeamRoleInput,
} from "@/features/booking/application/schemas/team-role-input/team-role-input.types";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { useTeamMutations } from "../use-team-mutations/use-team-mutations";
import type { TeamRoleDialogProps } from "./team-role-dialog.types";

/**
 * Drives the role dialog's form: validation, the add or rename write, and server field errors.
 * @param props - the dialog props
 * @returns the form, the pending flag and the submit handler
 */
export function useTeamRoleForm(props: Readonly<TeamRoleDialogProps>) {
  const { run } = useTeamMutations();
  const form = useForm<TeamRoleInput, unknown, TeamRoleFields>({
    resolver: zodResolver(teamRoleInputSchema),
    defaultValues: { name: props.role?.name ?? "" },
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    if (props.isOpen) {
      form.reset({ name: props.role?.name ?? "" });
      form.clearErrors();
    }
  }, [form, props.isOpen, props.role]);

  async function submit(): Promise<void> {
    if (!(await form.trigger())) return;
    setIsPending(true);
    try {
      const values = form.getValues();
      const { role, workspaceId, renameAction } = props;
      const result =
        role && renameAction
          ? await run(() => renameAction(workspaceId, role.id, values), {
              title: TEAM_COPY.roleSavedTitle,
            })
          : await run(() => props.addAction(workspaceId, values), {
              title: TEAM_COPY.roleAddedTitle,
            });
      if (result?.ok === false) {
        const key = result.fieldErrors.name;
        if (key) form.setError("name", { type: "server", message: key });
        return;
      }
      if (result?.ok && result.role) props.onCreated?.(result.role);
      props.onOpenChange(false);
    } catch {
      // useTeamMutations shows the retryable failure toast; the input stays in the form.
    } finally {
      setIsPending(false);
    }
  }
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    void submit();
  }
  return { form, isPending, handleSubmit };
}
