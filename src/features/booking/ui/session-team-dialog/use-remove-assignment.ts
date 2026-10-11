"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { showToast } from "@/ui/patterns/toast/toast";

import { SESSION_TEAM_DIALOG_COPY_NAMESPACE } from "./session-team-dialog.copy";
import type { SessionAssignment, SessionTeamDialogProps } from "./session-team-dialog.types";

/**
 * Owns the remove confirmation of *Atur tim*: the member being removed, the save, the toast and
 * the refresh. A cancelled project is refreshed so the read-only team shows (AC-TEAM-014, 015).
 * @param props - the dialog props
 * @returns the pending target and its handlers
 */
export function useRemoveAssignment(props: Readonly<SessionTeamDialogProps>) {
  const t = useTranslations(SESSION_TEAM_DIALOG_COPY_NAMESPACE);
  const router = useRouter();
  const [target, setTarget] = useState<SessionAssignment | null>(null);

  async function confirm(): Promise<void> {
    if (target === null) return;
    try {
      const result = await props.removeAction(props.workspaceId, props.projectId, target.id);
      if (result.ok) {
        showToast({
          tone: "success",
          title: t("removedToastTitle"),
          body: t("removedToastBody", { name: target.memberName, sessionName: props.session.name }),
        });
      } else {
        showToast({ tone: "danger", title: t("teamCancelledToast") });
      }
      router.refresh();
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        body: t("serverErrorBody"),
      });
    }
  }
  function handleOpenChange(isOpen: boolean): void {
    if (!isOpen) setTarget(null);
  }
  return { target, ask: setTarget, confirm, handleOpenChange };
}
