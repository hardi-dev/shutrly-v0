"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { TeamRoleDialog } from "../team-role-dialog/team-role-dialog";
import { MemberForm } from "./member-form";
import { TEAM_MEMBER_DIALOG_COPY_NAMESPACE } from "./team-member-dialog.copy";
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
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const controller = useTeamMemberForm(props);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const title = props.member ? t("memberEditTitle") : t("addMember");
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

function MemberSaveButton({
  isPending,
  isMobile,
}: Readonly<{ isPending: boolean; isMobile: boolean }>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  return (
    <Button type="submit" form={MEMBER_FORM_ID} isPending={isPending} size={isMobile ? "lg" : "md"}>
      {isPending ? t("saving") : t("save")}
    </Button>
  );
}

function MemberDialogShell({
  isOpen,
  onOpenChange,
  title,
  isPending,
  children,
}: Readonly<ShellProps>) {
  const t = useTranslations(TEAM_MEMBER_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const save = <MemberSaveButton isPending={isPending} isMobile={isMobile} />;
  function close(): void {
    onOpenChange(false);
  }
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={t("memberDialogDescription")}
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
      description={t("memberDialogDescription")}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={close} isDisabled={isPending}>
            {t("cancel")}
          </Button>
          {save}
        </>
      }
    >
      {children}
    </Modal>
  );
}
