"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AssignmentWriteResult } from "@/features/booking/application/use-cases/team-results/team-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { AssignmentDialogProps, AssignmentFormState } from "./assignment-dialog.types";

const IDLE: AssignmentFormState = { memberId: null, roleId: null, isPending: false, error: null };

function failureState(
  code: Exclude<Extract<AssignmentWriteResult, { ok: false }>["code"], "PROJECT_CANCELLED">,
  name: string,
): AssignmentFormState["error"] {
  const text = PROJECT_COPY.assignErrors[code](name);
  return { field: code === "ROLE_NOT_HELD" ? "role" : "member", text };
}

type Router = ReturnType<typeof useRouter>;
interface Named {
  readonly id: string;
  readonly name: string;
}

/** Saves the assignment and reports it; "left" means the dialog was closed or moved on. */
async function saveAssignment(
  props: Readonly<AssignmentDialogProps>,
  router: Router,
  member: Named,
  role: Named,
): Promise<AssignmentFormState["error"] | "left"> {
  try {
    const result = await props.addAction(props.workspaceId, props.projectId, props.session.id, {
      memberId: member.id,
      roleId: role.id,
    });
    if (result.ok) {
      showToast({
        tone: "success",
        title: PROJECT_COPY.assignedToastTitle,
        body: PROJECT_COPY.assignedToastBody(member.name, props.session.name, role.name),
      });
      router.refresh();
      props.onSaved();
      return "left";
    }
    const code = result.code;
    if (code === "PROJECT_CANCELLED") {
      showToast({ tone: "danger", title: PROJECT_COPY.teamCancelledToast });
      router.refresh();
      props.onOpenChange(false);
      return "left";
    }
    return failureState(code, member.name);
  } catch {
    showToast({
      tone: "danger",
      title: PROJECT_COPY.serverErrorTitle,
      body: PROJECT_COPY.serverErrorBody,
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
  const router = useRouter();
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
    const outcome = await saveAssignment(props, router, member, role);
    if (outcome !== "left") settle(outcome);
  }
  function handleSubmit(): void {
    void submit();
  }
  return { state, member, selectMember, selectRole, handleSubmit };
}
