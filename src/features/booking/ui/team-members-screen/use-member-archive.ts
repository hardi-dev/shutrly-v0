"use client";

import { useTranslations } from "next-intl";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { showToast } from "@/ui/patterns/toast/toast";

import { TEAM_MEMBERS_SCREEN_COPY_NAMESPACE } from "./team-members-screen.copy";
import type { TeamMembersScreenProps } from "./team-members-screen.types";

/**
 * Archives and restores members and shows the matching toast. Archiving offers *Batalkan*, which
 * restores the member (AC-TEAM-007); a failure shows a retryable danger toast (AC-TEAM-023).
 * @param workspaceId - the workspace
 * @param action - the archive server action
 * @returns `archive(member)` and `restore(member)`
 */
export function useMemberArchive(
  workspaceId: string,
  action: TeamMembersScreenProps["setArchivedAction"],
) {
  const t = useTranslations(TEAM_MEMBERS_SCREEN_COPY_NAMESPACE);
  async function setArchived(member: TeamMemberRecord, isArchived: boolean): Promise<void> {
    try {
      await action(workspaceId, member.id, isArchived);
    } catch {
      showToast({
        tone: "danger",
        title: t("serverErrorTitle"),
        action: {
          label: t("retry"),
          onAction: () => void setArchived(member, isArchived),
        },
      });
      return;
    }
    if (!isArchived) {
      showToast({ tone: "success", title: t("restoredTitle", { name: member.name }) });
      return;
    }
    showToast({
      tone: "success",
      title: t("archivedTitle", { name: member.name }),
      body: t("archivedBody"),
      action: { label: t("undo"), onAction: () => void setArchived(member, false) },
    });
  }
  function archive(member: TeamMemberRecord): void {
    void setArchived(member, true);
  }
  function restore(member: TeamMemberRecord): void {
    void setArchived(member, false);
  }
  return { archive, restore };
}
