"use client";

import { useState } from "react";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
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

  async function confirm(): Promise<void> {
    setIsPending(true);
    try {
      const result = await action(workspaceId, member.id);
      if (!result.ok) {
        setIsBlocked(true);
        return;
      }
      showToast({ tone: "success", title: TEAM_COPY.memberDeletedTitle(member.name) });
      onOpenChange(false);
    } catch {
      showToast({ tone: "danger", title: TEAM_COPY.serverErrorTitle });
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
      ? TEAM_COPY.memberDeleteBlockedTitle(member.name)
      : TEAM_COPY.memberDeleteTitle(member.name),
    description: isBlocked ? TEAM_COPY.memberDeleteBlockedBody : TEAM_COPY.memberDeleteBody,
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
          label={view.isPending ? TEAM_COPY.deleting : TEAM_COPY.delete}
          icon="trash-2"
          variant="destructive"
          isPending={view.isPending}
          onPress={view.confirm}
        />
      )}
      <SheetItem
        label={view.isBlocked ? TEAM_COPY.close : TEAM_COPY.cancel}
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
            {view.isBlocked ? TEAM_COPY.close : TEAM_COPY.cancel}
          </Button>
          {view.isBlocked ? null : (
            <Button variant="danger" onPress={view.confirm} isPending={view.isPending}>
              {TEAM_COPY.delete}
            </Button>
          )}
        </>
      }
    >
      {null}
    </Modal>
  );
}
