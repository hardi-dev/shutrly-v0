"use client";

import { compareSessions, formatSessionRange } from "@/features/booking/domain/session/session";
import type {
  SessionInput,
  SessionRecordShape,
} from "@/features/booking/domain/session/session.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { SessionDialog } from "../session-dialog/session-dialog";
import { SessionRowActions } from "../session-row-actions/session-row-actions";
import type { SessionRowProps, SessionsCardProps } from "./sessions-card.types";
import { useSessionEditing } from "./use-session-editing";

const PAD = 6;

// Sessions have no id before they are saved; the list position keeps ties stable.
function toShape(session: SessionInput, index: number): SessionRecordShape {
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
        <SessionList rows={rows} onEdit={editing.handleEdit} onRemove={props.onRemove} />
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
        onSave={editing.handleSave}
      />
    </>
  );
}

function SessionList({
  rows,
  onEdit,
  onRemove,
}: Readonly<{
  rows: readonly SessionRecordShape[];
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
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

function SessionRow({ row, isLast, onEdit, onRemove }: Readonly<SessionRowProps>) {
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
      trailing={<SessionRowActions name={row.name} onEdit={handleEdit} onDelete={handleDelete} />}
    />
  );
}
