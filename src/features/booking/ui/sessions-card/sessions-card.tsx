"use client";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { compareSessions, formatSessionRange } from "@/features/booking/domain/session/session";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { SessionDialog } from "../session-dialog/session-dialog";
import type { SessionWithTeam } from "../session-dialog/session-dialog.types";
import { SessionRowActions } from "../session-row-actions/session-row-actions";
import { SessionTeamAvatars } from "../session-team-avatars/session-team-avatars";
import type { SessionRowProps, SessionsCardProps } from "./sessions-card.types";
import { picksAsAssignments } from "./team-assignments";
import { useSessionEditing } from "./use-session-editing";

const PAD = 6;

// Sessions have no id before they are saved; the list position keeps ties stable.
function toShape(session: SessionWithTeam, index: number): SessionRecordShape {
  return { ...session, id: String(index), createdAt: String(index).padStart(PAD, "0") };
}

/** Lists the sessions in date order with add, edit and delete, kept in the form until the project is saved. */
export function SessionsCard(props: Readonly<SessionsCardProps>) {
  const editing = useSessionEditing(props);
  const rows = props.sessions.map(toShape).sort(compareSessions);
  return (
    <>
      <SectionCard
        title={PROJECT_COPY.scheduleTitle}
        description={
          props.isMobile
            ? PROJECT_COPY.scheduleDescriptionMobile
            : PROJECT_COPY.scheduleDescriptionDesktop
        }
        content="flush"
        actions={
          <Button variant="secondary" iconLeading="plus" onPress={editing.handleAdd}>
            {props.isMobile ? PROJECT_COPY.addSessionMobile : PROJECT_COPY.addSessionDesktop}
          </Button>
        }
      >
        <SessionList
          rows={rows}
          sessions={props.sessions}
          members={props.members}
          onEdit={editing.handleEdit}
          onRemove={props.onRemove}
        />
        {props.errorMessage ? (
          <p
            role="alert"
            className="px-(--space-6) pb-(--space-4) text-(length:--font-size-label) text-(--component-input-error-text)"
          >
            {props.errorMessage}
          </p>
        ) : null}
      </SectionCard>
      <SessionDialog
        isOpen={editing.isOpen}
        onOpenChange={editing.handleOpenChange}
        session={editing.session}
        members={props.members}
        onSave={editing.handleSave}
      />
    </>
  );
}

function SessionList({
  rows,
  sessions,
  members,
  onEdit,
  onRemove,
}: Readonly<{
  rows: readonly SessionRecordShape[];
  sessions: readonly SessionWithTeam[];
  members?: readonly AssignableMember[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        placement="in-card"
        title={PROJECT_COPY.scheduleEmptyTitle}
        body={PROJECT_COPY.scheduleEmptyBody}
      />
    );
  }
  return (
    <ul aria-label={PROJECT_COPY.scheduleTitle}>
      {rows.map((row, position) => (
        <SessionRow
          key={row.id}
          row={row}
          isLast={position === rows.length - 1}
          team={
            <SessionRowTeam
              row={row}
              picks={sessions[Number(row.id)]?.team ?? []}
              members={members ?? []}
              onEdit={onEdit}
            />
          }
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

/** The avatars of the picked members; they open the dialog where the team is edited (AC-TEAM-028). */
function SessionRowTeam({
  row,
  picks,
  members,
  onEdit,
}: Readonly<{
  row: SessionRecordShape;
  picks: readonly TeamPick[];
  members: readonly AssignableMember[];
  onEdit: (index: number) => void;
}>) {
  const assignments = picksAsAssignments(row.id, picks, members);
  const handleOpen = () => {
    onEdit(Number(row.id));
  };
  if (assignments.length === 0) return null;
  return (
    <SessionTeamAvatars sessionName={row.name} assignments={assignments} onOpen={handleOpen} />
  );
}

function SessionRow({ row, isLast, team, onEdit, onRemove }: Readonly<SessionRowProps>) {
  const index = Number(row.id);
  const handleEdit = () => {
    onEdit(index);
  };
  const handleDelete = () => {
    onRemove(index);
  };
  return (
    <ListCardItem
      icon="calendar"
      title={row.name}
      meta={formatSessionRange(row)}
      isLast={isLast}
      trailing={
        <div className="flex items-center gap-(--space-2)">
          {team}
          <SessionRowActions name={row.name} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      }
    />
  );
}
