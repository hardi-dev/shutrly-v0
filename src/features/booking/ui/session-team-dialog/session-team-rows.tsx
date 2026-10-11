"use client";

import { useTranslations } from "next-intl";

import { displayTeamRoleName } from "@/features/booking/domain/team-role/team-role";
import { clientInitials } from "@/features/booking/ui/client-initials/client-initials";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { Avatar } from "@/ui/primitives/avatar/avatar";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { SESSION_TEAM_DIALOG_COPY_NAMESPACE } from "./session-team-dialog.copy";
import type { SessionAssignment, SessionTeamRowsProps } from "./session-team-dialog.types";

/** The rows of *Atur tim*: avatar, name (+ *(diarsipkan)*), role and, while editable, the remove button. */
export function SessionTeamRows({
  sessionName,
  assignments,
  canEdit,
  onRemove,
}: Readonly<SessionTeamRowsProps>) {
  const t = useTranslations(SESSION_TEAM_DIALOG_COPY_NAMESPACE);
  return (
    <ul aria-label={t("teamListLabel", { sessionName })}>
      {assignments.map((assignment, index) => (
        <TeamRow
          key={assignment.id}
          assignment={assignment}
          isLast={index === assignments.length - 1}
          canEdit={canEdit}
          onRemove={onRemove}
          archivedMark={t("teamArchivedMark")}
          removeLabel={t("teamRemoveLabel")}
        />
      ))}
    </ul>
  );
}

function TeamRow({
  assignment,
  isLast,
  canEdit,
  onRemove,
  archivedMark,
  removeLabel,
}: Readonly<{
  assignment: SessionAssignment;
  isLast: boolean;
  canEdit: boolean;
  onRemove: (assignment: SessionAssignment) => void;
  archivedMark: string;
  removeLabel: string;
}>) {
  const appLocale = useAppLocale();
  function handleRemove(): void {
    onRemove(assignment);
  }
  const name = assignment.isMemberArchived
    ? `${assignment.memberName} ${archivedMark}`
    : assignment.memberName;
  return (
    <li
      className={`flex items-center gap-(--space-3) py-(--space-3) ${isLast ? "" : "border-b border-(--component-list-card-item-border)"}`}
    >
      <Avatar initials={clientInitials(assignment.memberName)} size="md" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        <span className="truncate text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary)">
          {name}
        </span>
        <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {displayTeamRoleName(
            { name: assignment.roleName, defaultKey: assignment.defaultKey },
            appLocale,
          )}
        </span>
      </span>
      {canEdit ? (
        <IconButton
          icon="trash-2"
          size="sm"
          tone="danger"
          aria-label={removeLabel}
          onPress={handleRemove}
        />
      ) : null}
    </li>
  );
}
