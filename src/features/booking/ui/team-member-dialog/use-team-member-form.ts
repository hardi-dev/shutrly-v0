"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import { teamMemberInputSchema } from "@/features/booking/application/schemas/team-member-input/team-member-input.schema";
import type {
  TeamMemberFields,
  TeamMemberInput,
} from "@/features/booking/application/schemas/team-member-input/team-member-input.types";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { useTeamMutations } from "../use-team-mutations/use-team-mutations";
import type { TeamMemberDialogProps } from "./team-member-dialog.types";

const FIELDS = ["name", "whatsappNumber", "email", "roleIds"] as const;

function formValues(member: TeamMemberDialogProps["member"]): TeamMemberInput {
  if (!member) return { name: "", whatsappNumber: "", email: "", roleIds: [] };
  return {
    name: member.name,
    whatsappNumber: formatWhatsappNumber(member.whatsappNumber),
    email: member.email ?? "",
    roleIds: member.roles.map((role) => role.id),
  };
}

type Run = ReturnType<typeof useTeamMutations>["run"];

function saveMember(run: Run, props: Readonly<TeamMemberDialogProps>, values: TeamMemberInput) {
  const { member, workspaceId } = props;
  if (member) {
    return run(() => props.updateAction(workspaceId, member.id, values), {
      title: TEAM_COPY.memberSavedTitle,
    });
  }
  return run(() => props.addAction(workspaceId, values), {
    title: TEAM_COPY.memberAddedTitle,
    body: TEAM_COPY.memberReadyBody(values.name.trim()),
  });
}

function byName(a: RoleRef, b: RoleRef): number {
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

/** Tells a session dialog about a member just added, with their roles by name (TD-A-1). */
function reportAdded(
  props: Readonly<TeamMemberDialogProps>,
  result: Awaited<ReturnType<typeof saveMember>>,
  roles: readonly RoleRef[],
  roleIds: readonly string[],
): void {
  if (!props.onAdded || props.member || !result?.ok || !result.member) return;
  const held = roles.filter((role) => roleIds.includes(role.id)).sort(byName);
  props.onAdded({ id: result.member.id, name: result.member.name, roles: held });
}

/**
 * Drives the member dialog's form: validation, the add or edit write, server field errors and the
 * roles created inline (A-5), which join the options and are selected.
 * @param props - the dialog props
 * @returns the form, its state, the role options and the handlers
 */
export function useTeamMemberForm(props: Readonly<TeamMemberDialogProps>) {
  const { run } = useTeamMutations();
  const form = useForm<TeamMemberInput, unknown, TeamMemberFields>({
    resolver: zodResolver(teamMemberInputSchema),
    defaultValues: formValues(props.member),
    shouldFocusError: true,
  });
  const [isPending, setIsPending] = useState(false);
  const [numberHolder, setNumberHolder] = useState<NumberHolder | undefined>();
  const roleOptions = useRoleOptions(props.roles, form);
  useEffect(() => {
    if (props.isOpen) {
      form.reset(formValues(props.member));
      form.clearErrors();
    }
  }, [form, props.isOpen, props.member]);

  async function submit(): Promise<void> {
    if (!(await form.trigger())) return;
    setIsPending(true);
    try {
      const values = form.getValues();
      const result = await saveMember(run, props, values);
      if (result?.ok === false) {
        setNumberHolder(result.numberHolder);
        for (const field of FIELDS) {
          const key = result.fieldErrors[field];
          if (key) form.setError(field, { type: "server", message: key });
        }
        return;
      }
      reportAdded(props, result, roleOptions.roles, values.roleIds);
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
  return {
    form,
    isPending,
    numberHolder,
    handleSubmit,
    options: roleOptions.options,
    handleRoleCreated: roleOptions.handleRoleCreated,
  };
}

/** The role options plus the roles created inline, and the handler that selects a new one (A-5). */
function useRoleOptions(
  roles: readonly RoleRef[],
  form: ReturnType<typeof useForm<TeamMemberInput, unknown, TeamMemberFields>>,
) {
  const [created, setCreated] = useState<readonly RoleRef[]>([]);
  function handleRoleCreated(role: RoleRef): void {
    setCreated((previous) => [...previous, role]);
    form.setValue("roleIds", [...form.getValues("roleIds"), role.id], { shouldValidate: true });
  }
  const all = [...roles, ...created.filter((c) => !roles.some((r) => r.id === c.id))].sort(byName);
  const options = all.map((role) => ({ id: role.id, label: role.name }));
  return { roles: all, options, handleRoleCreated };
}
