"use client";

import { useRouter } from "next/navigation";

import { formatSessionRange } from "@/features/booking/domain/session/session";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { AssignmentDialogProps, AssignmentShellProps } from "./assignment-dialog.types";
import { useAssignmentForm } from "./use-assignment-form";

/**
 * The Penugasan form: pick an active member who is not on the session yet, then one of their roles.
 * A workspace with no active members shows an empty state that points to *Tim* (AC-TEAM-027).
 * @param props - the session, the members that can still be added and the save action
 * @returns the dialog as a desktop modal or a phone form sheet
 */
export function AssignmentDialog(props: Readonly<AssignmentDialogProps>) {
  const isMobile = useMobileViewport();
  const router = useRouter();
  const form = useAssignmentForm(props);
  const isEmpty = props.members.length === 0;
  function handleOpenTeam(): void {
    router.push(`/w/${props.workspaceId}/team`);
  }
  function close(): void {
    props.onOpenChange(false);
  }
  const body = isEmpty ? (
    <EmptyState
      placement="in-card"
      icon="user-round-cog"
      title={PROJECT_COPY.assignEmptyTitle}
      body={PROJECT_COPY.assignEmptyBody}
      action={
        <Button variant="secondary" iconLeading="user-round-cog" onPress={handleOpenTeam}>
          {PROJECT_COPY.assignEmptyAction}
        </Button>
      }
    />
  ) : (
    <AssignmentFields {...props} form={form} />
  );
  const submit = (
    <Button
      size={isMobile ? "lg" : "md"}
      isPending={form.state.isPending}
      isDisabled={isEmpty || form.state.roleId === null}
      onPress={form.handleSubmit}
    >
      {form.state.isPending ? PROJECT_COPY.assignSubmitting : PROJECT_COPY.assignSubmit}
    </Button>
  );
  return (
    <AssignmentShell
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={PROJECT_COPY.assignTitle(props.session.name)}
      description={formatSessionRange(props.session)}
      isPending={form.state.isPending}
      onClose={close}
      submit={submit}
    >
      {body}
    </AssignmentShell>
  );
}

function AssignmentShell({
  isOpen,
  onOpenChange,
  title,
  description,
  isPending,
  onClose,
  submit,
  children,
}: Readonly<AssignmentShellProps>) {
  const isMobile = useMobileViewport();
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant="form"
        actions={submit}
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
      actions={
        <>
          <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
            {PROJECT_COPY.assignCancel}
          </Button>
          {submit}
        </>
      }
    >
      {children}
    </Modal>
  );
}

function AssignmentFields({
  members,
  form,
}: Readonly<AssignmentDialogProps & { form: ReturnType<typeof useAssignmentForm> }>) {
  const { state, member } = form;
  const memberOptions = members.map((candidate) => ({ id: candidate.id, label: candidate.name }));
  const roleOptions = (member?.roles ?? []).map((role) => ({ id: role.id, label: role.name }));
  return (
    <div className="flex flex-col gap-(--space-4)">
      <Select
        label={PROJECT_COPY.assignMember}
        placeholder={PROJECT_COPY.assignMemberPlaceholder}
        options={memberOptions}
        value={state.memberId}
        onChange={form.selectMember}
        description={PROJECT_COPY.assignMemberHint}
        errorMessage={state.error?.field === "member" ? state.error.text : undefined}
        isDisabled={state.isPending}
      />
      <Select
        label={PROJECT_COPY.assignRole}
        placeholder={PROJECT_COPY.assignRolePlaceholder}
        options={roleOptions}
        value={state.roleId}
        onChange={form.selectRole}
        description={member ? PROJECT_COPY.assignRoleHint(member.name) : undefined}
        errorMessage={state.error?.field === "role" ? state.error.text : undefined}
        isDisabled={state.isPending || member === undefined}
      />
    </div>
  );
}
