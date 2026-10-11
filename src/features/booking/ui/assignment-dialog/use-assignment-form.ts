"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AssignmentWriteResult } from "@/features/booking/application/use-cases/team-results/team-results.types";
import {
  type DefaultTeamRoleKey,
  displayTeamRoleName,
} from "@/features/booking/domain/team-role/team-role";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { showToast } from "@/ui/patterns/toast/toast";

import { ASSIGN_ERROR_MESSAGE_KEY } from "../project-copy/project-copy.copy";
import type { ProjectTranslate } from "../project-copy/project-copy.types";
import { ASSIGNMENT_DIALOG_COPY_NAMESPACE } from "./assignment-dialog.copy";
import type { AssignmentDialogProps, AssignmentFormState } from "./assignment-dialog.types";

const IDLE: AssignmentFormState = { memberId: null, roleId: null, isPending: false, error: null };

function failureState(
  t: ProjectTranslate,
  code: Exclude<Extract<AssignmentWriteResult, { ok: false }>["code"], "PROJECT_CANCELLED">,
  name: string,
): AssignmentFormState["error"] {
  const text = t(ASSIGN_ERROR_MESSAGE_KEY[code], { name });
  return { field: code === "ROLE_NOT_HELD" ? "role" : "member", text };
}

type Router = ReturnType<typeof useRouter>;
interface Named {
  readonly id: string;
  readonly name: string;
}

type NamedRole = Named & { readonly defaultKey: DefaultTeamRoleKey | null };

/** Saves the assignment and reports it; "left" means the dialog was closed or moved on. */
async function saveAssignment(
  t: ProjectTranslate,
  props: Readonly<AssignmentDialogProps>,
  router: Router,
  member: Named,
  role: NamedRole,
  roleName: string,
): Promise<AssignmentFormState["error"] | "left"> {
  try {
    const result = await props.addAction(props.workspaceId, props.projectId, props.session.id, {
      memberId: member.id,
      roleId: role.id,
    });
    if (result.ok) {
      showToast({
        tone: "success",
        title: t("assignedToastTitle"),
        body: t("assignedToastBody", {
          name: member.name,
          sessionName: props.session.name,
          role: roleName,
        }),
      });
      router.refresh();
      props.onSaved();
      return "left";
    }
    const code = result.code;
    if (code === "PROJECT_CANCELLED") {
      showToast({ tone: "danger", title: t("teamCancelledToast") });
      router.refresh();
      props.onOpenChange(false);
      return "left";
    }
    return failureState(t, code, member.name);
  } catch {
    showToast({
      tone: "danger",
      title: t("serverErrorTitle"),
      body: t("serverErrorBody"),
    });
    return null;
  }
}

/**
 * Drives the Penugasan form: the chosen member and role (the member's first role is preselected),
 * the save, the toast and the form errors per failure code (AC-TEAM-011, AC-TEAM-013).
 * The dialog is mounted fresh for each opening, so the state starts empty.
 * @param props - the dialog props
 * @param initialMemberId - a member to preselect, e.g. one just added (Revision OT #2)
 * @returns the state, the selected member and the handlers
 */
export function useAssignmentForm(
  props: Readonly<AssignmentDialogProps>,
  initialMemberId: string | null = null,
) {
  const t = useTranslations(ASSIGNMENT_DIALOG_COPY_NAMESPACE);
  const router = useRouter();
  const appLocale = useAppLocale();
  const [state, setState] = useState<AssignmentFormState>(() => {
    const initial = props.members.find((candidate) => candidate.id === initialMemberId);
    return initial
      ? { ...IDLE, memberId: initial.id, roleId: initial.roles.at(0)?.id ?? null }
      : IDLE;
  });
  const member = props.members.find((candidate) => candidate.id === state.memberId);

  function selectMember(memberId: string): void {
    const next = props.members.find((candidate) => candidate.id === memberId);
    setState({ ...IDLE, memberId, roleId: next?.roles.at(0)?.id ?? null });
  }
  function selectRole(roleId: string): void {
    setState((previous) => ({ ...previous, roleId, error: null }));
  }
  function settle(error: AssignmentFormState["error"]): void {
    setState((previous) => ({ ...previous, isPending: false, error }));
  }
  async function submit(): Promise<void> {
    const role = member?.roles.find((candidate) => candidate.id === state.roleId);
    if (!member || !role) return;
    setState((previous) => ({ ...previous, isPending: true, error: null }));
    const roleName = displayTeamRoleName(role, appLocale);
    const outcome = await saveAssignment(t, props, router, member, role, roleName);
    if (outcome !== "left") settle(outcome);
  }
  function handleSubmit(): void {
    void submit();
  }
  return { state, member, selectMember, selectRole, handleSubmit };
}
