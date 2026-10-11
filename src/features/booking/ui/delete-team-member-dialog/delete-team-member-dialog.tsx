"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { DELETE_TEAM_MEMBER_DIALOG_COPY_NAMESPACE } from "./delete-team-member-dialog.copy";
import type {
  DeleteMemberView,
  DeleteTeamMemberDialogProps,
} from "./delete-team-member-dialog.types";

/**
 * Confirms a member delete, then explains why it is blocked when the server reports assignments.
 * @param props - the member to delete and the server action
 * @returns the dialog, or nothing when no member is selected
 */
export function DeleteTeamMemberDialog({ member, ...rest }: Readonly<DeleteTeamMemberDialogProps>) {
  if (!member) return null;
  return <DeleteMemberBody key={member.id} member={member} {...rest} />;
}

function DeleteMemberBody({
  member,
  workspaceId,
  onOpenChange,
  action,
}: Readonly<Omit<DeleteTeamMemberDialogProps, "member"> & { readonly member: TeamMemberRecord }>) {
  const isMobile = useMobileViewport();
  const [isPending, setIsPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const t = useTranslations(DELETE_TEAM_MEMBER_DIALOG_COPY_NAMESPACE);

  async function confirm(): Promise<void> {
    setIsPending(true);
    try {
      const result = await action(workspaceId, member.id);
      if (!result.ok) {
        setIsBlocked(true);
        return;
      }
      showToast({ tone: "success", title: t("memberDeletedTitle", { name: member.name }) });
      onOpenChange(false);
    } catch {
      showToast({ tone: "danger", title: t("serverErrorTitle") });
    } finally {
      setIsPending(false);
    }
  }
  function close(): void {
    onOpenChange(false);
  }
  function handleConfirm(): void {
    void confirm();
  }
  const view: DeleteMemberView = {
    title: isBlocked
      ? t("memberDeleteBlockedTitle", { name: member.name })
      : t("memberDeleteTitle", { name: member.name }),
    description: isBlocked ? t("memberDeleteBlockedBody") : t("memberDeleteBody"),
    isBlocked,
    isPending,
    close,
    confirm: handleConfirm,
  };
  return isMobile ? (
    <DeleteMemberSheet view={view} onOpenChange={onOpenChange} />
  ) : (
    <DeleteMemberModal view={view} onOpenChange={onOpenChange} />
  );
}

function DeleteMemberSheet({
  view,
  onOpenChange,
}: Readonly<{ view: DeleteMemberView; onOpenChange: (isOpen: boolean) => void }>) {
  const t = useTranslations(DELETE_TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title={view.title}
      description={view.description}
      variant="actions"
    >
      {view.isBlocked ? null : (
        <SheetItem
          label={view.isPending ? t("deleting") : t("delete")}
          icon="trash-2"
          variant="destructive"
          isPending={view.isPending}
          onPress={view.confirm}
        />
      )}
      <SheetItem
        label={view.isBlocked ? t("close") : t("cancel")}
        isDisabled={view.isPending}
        onPress={view.close}
      />
    </BottomSheet>
  );
}

function DeleteMemberModal({
  view,
  onOpenChange,
}: Readonly<{ view: DeleteMemberView; onOpenChange: (isOpen: boolean) => void }>) {
  const t = useTranslations(DELETE_TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  return (
    <Modal
      isOpen
      onOpenChange={onOpenChange}
      title={view.title}
      description={view.description}
      size="sm"
      isDestructive={!view.isBlocked}
      actions={
        <>
          <Button variant="secondary" onPress={view.close} isDisabled={view.isPending}>
            {view.isBlocked ? t("close") : t("cancel")}
          </Button>
          {view.isBlocked ? null : (
            <Button variant="danger" onPress={view.confirm} isPending={view.isPending}>
              {t("delete")}
            </Button>
          )}
        </>
      }
    >
      {null}
    </Modal>
  );
}
