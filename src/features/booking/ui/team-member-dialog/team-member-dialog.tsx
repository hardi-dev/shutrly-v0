"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamRoleDialog } from "../team-role-dialog/team-role-dialog";
import { MemberForm } from "./member-form";
import type { ShellProps, TeamMemberDialogProps } from "./team-member-dialog.types";
import { useTeamMemberForm } from "./use-team-member-form";

const MEMBER_FORM_ID = "team-member-form";

/**
 * Presents the add or edit member form as a desktop modal or a phone form sheet, with the role
 * dialog opening on top of it for *Tambah peran baru* (A-5).
 * @param props - the dialog props
 * @returns the dialog
 */
export function TeamMemberDialog(props: Readonly<TeamMemberDialogProps>) {
  const controller = useTeamMemberForm(props);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const title = props.member ? TEAM_COPY.memberEditTitle : TEAM_COPY.addMember;
  function handleCreateRole(): void {
    setIsRoleDialogOpen(true);
  }
  const body = <MemberForm controller={controller} onCreateRole={handleCreateRole} />;
  const shell = (
    <MemberDialogShell
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={title}
      isPending={controller.isPending}
    >
      {body}
    </MemberDialogShell>
  );
  return (
    <>
      {shell}
      <TeamRoleDialog
        isOpen={isRoleDialogOpen}
        workspaceId={props.workspaceId}
        onOpenChange={setIsRoleDialogOpen}
        onCreated={controller.handleRoleCreated}
        addAction={props.addRoleAction}
      />
    </>
  );
}

function MemberDialogShell({
  isOpen,
  onOpenChange,
  title,
  isPending,
  children,
}: Readonly<ShellProps>) {
  const isMobile = useMobileViewport();
  const save = (
    <Button type="submit" form={MEMBER_FORM_ID} isPending={isPending} size={isMobile ? "lg" : "md"}>
      {isPending ? TEAM_COPY.saving : TEAM_COPY.save}
    </Button>
  );
  function close(): void {
    onOpenChange(false);
  }
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={TEAM_COPY.memberDialogDescription}
        variant="form"
        actions={save}
      >
        {children}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={TEAM_COPY.memberDialogDescription}
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
      {children}
    </Modal>
  );
}
