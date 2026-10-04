"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SessionAssignment, SessionTeamDialogProps } from "./session-team-dialog.types";

/**
 * Owns the remove confirmation of *Atur tim*: the member being removed, the save, the toast and
 * the refresh. A cancelled project is refreshed so the read-only team shows (AC-TEAM-014, 015).
 * @param props - the dialog props
 * @returns the pending target and its handlers
 */
export function useRemoveAssignment(props: Readonly<SessionTeamDialogProps>) {
  const router = useRouter();
  const [target, setTarget] = useState<SessionAssignment | null>(null);

  async function confirm(): Promise<void> {
    if (target === null) return;
    try {
      const result = await props.removeAction(props.workspaceId, props.projectId, target.id);
      if (result.ok) {
        showToast({
          tone: "success",
          title: PROJECT_COPY.removedToastTitle,
          body: PROJECT_COPY.removedToastBody(target.memberName, props.session.name),
        });
      } else {
        showToast({ tone: "danger", title: PROJECT_COPY.teamCancelledToast });
      }
      router.refresh();
    } catch {
      showToast({
        tone: "danger",
        title: PROJECT_COPY.serverErrorTitle,
        body: PROJECT_COPY.serverErrorBody,
      });
    }
  }
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) setTarget(null);
  }
  return { target, ask: setTarget, confirm, handleOpenChange };
}
