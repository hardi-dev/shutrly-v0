"use client";

import { formatSessionRange } from "@/features/booking/domain/session/session";
import { firstName } from "@/features/booking/domain/session-assignment/session-assignment";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";

import { ProjectConfirmDialog } from "../project-confirm-dialog/project-confirm-dialog";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SessionTeamDialogProps, SessionTeamShellProps } from "./session-team-dialog.types";
import { SessionTeamRows } from "./session-team-rows";
import { useRemoveAssignment } from "./use-remove-assignment";

/**
 * *Atur tim*: the members of one session with their roles. While the project can change it removes
 * a member (after a confirmation) and opens the Penugasan form for more; on a cancelled project it
 * is read-only (AC-TEAM-014, AC-TEAM-015).
 * @param props - the session, its assignments and the actions
 * @returns the dialog as a desktop modal or a phone form sheet, with the remove confirmation
 */
export function SessionTeamDialog(props: Readonly<SessionTeamDialogProps>) {
  const locale = useFormattingLocale();
  const remove = useRemoveAssignment(props);
  const { session, assignments, canEdit } = props;
  function close(): void {
    props.onOpenChange(false);
  }
  return (
    <>
      <SessionTeamShell
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={PROJECT_COPY.teamTitle(session.name)}
        description={formatSessionRange(session, locale)}
        actions={<SessionTeamActions canEdit={canEdit} onAdd={props.onAddMember} onClose={close} />}
      >
        {canEdit ? null : (
          <p className="pb-(--space-2) text-(length:--font-size-body-sm) text-(--color-semantic-text-muted)">
            {PROJECT_COPY.teamCancelledNote}
          </p>
        )}
        <SessionTeamRows
          sessionName={session.name}
          assignments={assignments}
          canEdit={canEdit}
          onRemove={remove.ask}
        />
      </SessionTeamShell>
      <ProjectConfirmDialog
        key={remove.target?.id ?? "none"}
        isOpen={remove.target !== null}
        onOpenChange={remove.handleOpenChange}
        title={PROJECT_COPY.removeAssignmentTitle(remove.target?.memberName ?? "", session.name)}
        body={PROJECT_COPY.removeAssignmentBody(firstName(remove.target?.memberName ?? ""))}
        confirmLabel={PROJECT_COPY.removeAssignmentConfirm}
        onConfirm={remove.confirm}
      />
    </>
  );
}

function SessionTeamActions({
  canEdit,
  onAdd,
  onClose,
}: Readonly<{ canEdit: boolean; onAdd: () => void; onClose: () => void }>) {
  const isMobile = useMobileViewport();
  const size = isMobile ? "lg" : "md";
  if (!canEdit) {
    // The phone sheet has no footer button: its close control is enough (export).
    return isMobile ? null : (
      <Button variant="secondary" onPress={onClose}>
        {PROJECT_COPY.teamClose}
      </Button>
    );
  }
  return (
    <>
      <Button variant="secondary" size={size} iconLeading="user-plus" onPress={onAdd}>
        {PROJECT_COPY.teamAddMember}
      </Button>
      {isMobile ? null : <Button onPress={onClose}>{PROJECT_COPY.teamDone}</Button>}
    </>
  );
}

function SessionTeamShell({
  isOpen,
  onOpenChange,
  title,
  description,
  actions,
  children,
}: Readonly<SessionTeamShellProps>) {
  const isMobile = useMobileViewport();
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant="form"
        actions={actions}
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
      description={description}
      size="md"
      actions={actions}
    >
      {children}
    </Modal>
  );
}
