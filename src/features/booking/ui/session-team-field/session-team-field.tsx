"use client";

import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";
import { clientInitials } from "@/features/booking/ui/client-initials/client-initials";
import { Select } from "@/ui/patterns/select/select";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TEXT_FIELD_COPY } from "@/ui/primitives/text-field/text-field.copy";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SessionTeamFieldProps } from "./session-team-field.types";
import type { useTeamPicker } from "./use-team-picker";

/**
 * The *Tim* field of the session dialog: the members picked for the session with a remove button
 * each, and a row to pick another member and their role. Nothing is saved until the project is
 * (AC-TEAM-028); the server checks every pick again.
 * @param props - the active members, the picks and the change handler
 * @returns the field
 */
export function SessionTeamField(props: Readonly<SessionTeamFieldProps>) {
  const { picker } = props;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        <span className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
          {PROJECT_COPY.sessionTeamLabel}
          <span className="font-normal text-(--color-semantic-text-muted)">{` ${TEXT_FIELD_COPY.optionalSuffix}`}</span>
        </span>
        <span className="text-(length:--font-size-label) text-(--component-input-helper)">
          {props.members.length === 0 ? PROJECT_COPY.sessionTeamNone : PROJECT_COPY.sessionTeamHint}
        </span>
      </div>
      <PickedMembers
        members={props.members}
        picks={picker.picks}
        isDisabled={props.isDisabled}
        onRemove={picker.remove}
      />
      {picker.candidates.length > 0 ? (
        <AddRow picker={picker} isDisabled={props.isDisabled} />
      ) : null}
    </div>
  );
}

function PickedMembers({
  members,
  picks,
  isDisabled,
  onRemove,
}: Readonly<{
  members: SessionTeamFieldProps["members"];
  picks: readonly TeamPick[];
  isDisabled?: boolean;
  onRemove: (memberId: string) => void;
}>) {
  if (picks.length === 0) return null;
  return (
    <ul aria-label={PROJECT_COPY.sessionTeamListLabel} className="flex flex-col">
      {picks.map((pick) => {
        const member = members.find((m) => m.id === pick.memberId);
        const role = member?.roles.find((r) => r.id === pick.roleId);
        function handleRemove(): void {
          onRemove(pick.memberId);
        }
        return (
          <li key={pick.memberId} className="flex items-center gap-(--space-3) py-(--space-2)">
            <Avatar initials={clientInitials(member?.name ?? "")} size="md" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-(length:--font-size-body) font-semibold">
                {member?.name}
              </span>
              <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
                {role?.name}
              </span>
            </span>
            <IconButton
              icon="trash-2"
              size="sm"
              tone="danger"
              aria-label={PROJECT_COPY.teamRemoveLabel}
              isDisabled={isDisabled}
              onPress={handleRemove}
            />
          </li>
        );
      })}
    </ul>
  );
}

function AddRow({
  picker,
  isDisabled,
}: Readonly<{ picker: ReturnType<typeof useTeamPicker>; isDisabled?: boolean }>) {
  const { state, candidates, member } = picker;
  const memberOptions = candidates.map((candidate) => ({
    id: candidate.id,
    label: candidate.name,
  }));
  const roleOptions = (member?.roles ?? []).map((role) => ({ id: role.id, label: role.name }));
  return (
    <div className="flex flex-col gap-(--space-3)">
      <div className="grid grid-cols-2 items-start gap-(--space-3)">
        <Select
          label={PROJECT_COPY.sessionTeamMember}
          placeholder={PROJECT_COPY.assignMemberPlaceholder}
          options={memberOptions}
          value={state.memberId}
          onChange={picker.selectMember}
          isDisabled={isDisabled}
        />
        <Select
          label={PROJECT_COPY.sessionTeamRole}
          placeholder={PROJECT_COPY.assignRolePlaceholder}
          options={roleOptions}
          value={state.roleId}
          onChange={picker.selectRole}
          isDisabled={isDisabled || member === undefined}
        />
      </div>
      <Button
        variant="secondary"
        iconLeading="user-plus"
        isDisabled={isDisabled || state.roleId === null}
        onPress={picker.add}
      >
        {PROJECT_COPY.teamAddMember}
      </Button>
    </div>
  );
}
