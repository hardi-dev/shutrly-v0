"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { formatSessionRange } from "@/features/booking/domain/session/session";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Modal } from "@/ui/patterns/modal/modal";
import { Select } from "@/ui/patterns/select/select";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { AddTeamMemberButton, useCanQuickAddMember } from "../team-quick-add/team-quick-add";
import type {
  AssignmentDialogBodyProps,
  AssignmentDialogProps,
  AssignmentShellProps,
  NoMembersProps,
} from "./assignment-dialog.types";
import { useAssignmentForm } from "./use-assignment-form";

/**
 * The Penugasan form: pick an active member who is not on the session yet, then one of their roles.
 * A workspace with no active members shows an empty state that points to *Tim* (AC-TEAM-027).
 * @param props - the session, the members that can still be added and the save action
 * @returns the dialog as a desktop modal or a phone form sheet
 */
export function AssignmentDialog(props: Readonly<AssignmentDialogProps>) {
  const [added, setAdded] = useState<readonly AssignableMember[]>([]);
  const members = [
    ...props.members,
    ...added.filter((member) => !props.members.some((m) => m.id === member.id)),
  ];
  // Revision OT #2: a member added from the empty state is selected; remounting the form preselects them.
  const handleAdded = (member: AssignableMember) => {
    setAdded((previous) => [...previous, member]);
  };
  return (
    <AssignmentDialogBody
      key={added.length}
      {...props}
      members={members}
      initialMemberId={added.at(-1)?.id ?? null}
      onMemberAdded={handleAdded}
    />
  );
}

function AssignmentDialogBody(props: Readonly<AssignmentDialogBodyProps>) {
  const locale = useFormattingLocale();
  const isMobile = useMobileViewport();
  const router = useRouter();
  const form = useAssignmentForm(props, props.initialMemberId);
  const canQuickAdd = useCanQuickAddMember();
  const isEmpty = props.members.length === 0;
  function handleOpenTeam(): void {
    router.push(`/w/${props.workspaceId}/team`);
  }
  function close(): void {
    props.onOpenChange(false);
  }
  const body = isEmpty ? (
    <NoMembers
      canQuickAdd={canQuickAdd}
      onAdded={props.onMemberAdded}
      onOpenTeam={handleOpenTeam}
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
      description={formatSessionRange(props.session, locale)}
      isPending={form.state.isPending}
      onClose={close}
      submit={submit}
    >
      {body}
    </AssignmentShell>
  );
}

/** No active member yet: *Tambah anggota* on top of this dialog, or *Buka Tim* without quick add (AC-TEAM-027, Revision OT #2). */
function NoMembers({ canQuickAdd, onAdded, onOpenTeam }: Readonly<NoMembersProps>) {
  return (
    <EmptyState
      placement="in-card"
      icon="user-round-cog"
      title={PROJECT_COPY.assignEmptyTitle}
      body={canQuickAdd ? PROJECT_COPY.assignEmptyQuickBody : PROJECT_COPY.assignEmptyBody}
      action={
        canQuickAdd ? (
          <AddTeamMemberButton onAdded={onAdded} />
        ) : (
          <Button variant="secondary" iconLeading="user-round-cog" onPress={onOpenTeam}>
            {PROJECT_COPY.assignEmptyAction}
          </Button>
        )
      }
    />
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
