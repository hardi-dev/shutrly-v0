import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { needsSession } from "@/features/booking/domain/project-status/project-status";
import { formatSessionRange } from "@/features/booking/domain/session/session";
import { assignmentsBySession } from "@/features/booking/domain/session-assignment/session-assignment";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { describePackageItem } from "../package-items-card/package-items-card";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectRowMenu } from "../project-row-menu/project-row-menu";
import type { RowMenuEntry } from "../project-row-menu/project-row-menu.types";
import { SessionRowActions } from "../session-row-actions/session-row-actions";
import type { SessionTeamAction } from "../session-row-actions/session-row-actions.types";
import { SessionTeamAvatars } from "../session-team-avatars/session-team-avatars";
import { displayBookingValue } from "./booking-value-display";
import type {
  DetailEditHandlers,
  ProjectDetailCardProps,
  SessionRowProps,
  SessionTeamHandlers,
  SessionTrailingProps,
} from "./project-detail-screen.types";
import { ProjectFacts } from "./project-facts";

function lockedDescription(project: ProjectDetailCardProps["project"]): string | undefined {
  if (project.status === "CANCELLED") return PROJECT_COPY.cancelledDescription;
  return project.canEditDeal ? undefined : PROJECT_COPY.lockedDescription;
}

/** Info card: client, service, agreed price and internal notes; Ubah info shows while the project can change. */
export function ProjectInfoCard({
  project,
  isMobile,
  onEdit,
}: Readonly<ProjectDetailCardProps & { onEdit?: () => void }>) {
  const locale = useFormattingLocale();
  const number = project.client.whatsappNumber;
  const client = number
    ? `${project.client.name} · ${formatWhatsappNumber(number)}`
    : project.client.name;
  return (
    <SectionCard
      title={PROJECT_COPY.infoTitle}
      content="flush"
      actions={
        onEdit && project.canEditInfo ? (
          <Button variant="secondary" iconLeading="pencil" onPress={onEdit}>
            {isMobile ? PROJECT_COPY.infoEditMobile : PROJECT_COPY.infoEditDesktop}
          </Button>
        ) : null
      }
    >
      <ProjectFacts
        facts={[
          { label: PROJECT_COPY.infoClient, value: client },
          { label: PROJECT_COPY.infoService, value: project.service.name },
          { label: PROJECT_COPY.infoPrice, value: formatIdr(project.agreedPrice, locale) },
          { label: PROJECT_COPY.infoNotes, value: project.notes },
        ]}
      />
    </SectionCard>
  );
}

/** Package card: the items copied from the service; Tambah item and the item ⋯ show while the deal is editable. */
export function ProjectPackageCard({
  project,
  isMobile,
  edit,
}: Readonly<ProjectDetailCardProps & { edit?: DetailEditHandlers }>) {
  const description =
    lockedDescription(project) ??
    (isMobile
      ? PROJECT_COPY.packageDescriptionDetailMobile
      : PROJECT_COPY.packageDescriptionDetailDesktop(project.service.name));
  return (
    <SectionCard
      title={PROJECT_COPY.packageTitle}
      description={description}
      content="flush"
      actions={
        edit && project.canEditDeal ? (
          <Button variant="secondary" iconLeading="plus" onPress={edit.onAddItem}>
            {isMobile ? PROJECT_COPY.addItemMobile : PROJECT_COPY.addItemDesktop}
          </Button>
        ) : null
      }
    >
      {project.items.length === 0 ? (
        <EmptyState
          icon="package"
          placement="in-card"
          title={PROJECT_COPY.packageEmptyTitle}
          body={PROJECT_COPY.packageEmptyBody}
        />
      ) : (
        <ul aria-label={PROJECT_COPY.packageTitle}>
          {project.items.map((item, index) => (
            <ListCardItem
              key={item.id}
              icon={item.pickMode ? "images" : "package"}
              title={item.name}
              meta={describePackageItem({ ...item, definitionName: item.name })}
              isLast={index === project.items.length - 1}
              trailing={
                edit && project.canEditDeal ? <ItemMenu item={item} edit={edit} /> : undefined
              }
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function ItemMenu({
  item,
  edit,
}: Readonly<{
  item: ProjectDetailCardProps["project"]["items"][number];
  edit: DetailEditHandlers;
}>) {
  const entries: RowMenuEntry[] = [
    {
      label: PROJECT_COPY.itemEditValue,
      icon: "pencil",
      onSelect: () => {
        edit.onEditItem(item);
      },
    },
    {
      label: PROJECT_COPY.itemRemove,
      icon: "trash-2",
      isDestructive: true,
      onSelect: () => {
        edit.onRemoveItem(item);
      },
    },
  ];
  return (
    <ProjectRowMenu
      label={PROJECT_COPY.itemActions(item.name)}
      title={item.name}
      entries={entries}
    />
  );
}

function scheduleDescription({ project, isMobile }: Readonly<ProjectDetailCardProps>): string {
  if (project.status === "CANCELLED") return PROJECT_COPY.cancelledDescription;
  return isMobile
    ? PROJECT_COPY.scheduleDescriptionDetailMobile
    : PROJECT_COPY.scheduleDescriptionDetailDesktop;
}

function fieldsDescription({ project, isMobile }: Readonly<ProjectDetailCardProps>): string {
  const locked = lockedDescription(project);
  if (locked !== undefined) return locked;
  return isMobile
    ? PROJECT_COPY.fieldsDescriptionDetailMobile(project.service.name)
    : PROJECT_COPY.fieldsDescriptionDetailDesktop(project.service.name);
}

/** Schedule card: sessions in date order; Tambah sesi and the session ⋯ show while the project is not cancelled. */
export function ProjectScheduleCard(
  props: Readonly<
    ProjectDetailCardProps & { edit?: DetailEditHandlers; team?: SessionTeamHandlers }
  >,
) {
  const { project, isMobile, edit, team } = props;
  const byUnit = assignmentsBySession(project.assignments);
  const description = scheduleDescription(props);
  const canEdit = edit !== undefined && project.canEditSchedule;
  const isLastOfBooked = needsSession(project.status) && project.sessions.length <= 1;
  return (
    <SectionCard
      title={PROJECT_COPY.scheduleTitle}
      description={description}
      content="flush"
      actions={
        canEdit ? (
          <Button variant="secondary" iconLeading="plus" onPress={edit.onAddSession}>
            {isMobile ? PROJECT_COPY.addSessionMobile : PROJECT_COPY.addSessionDesktop}
          </Button>
        ) : null
      }
    >
      {project.sessions.length === 0 ? (
        <EmptyState
          icon="calendar"
          placement="in-card"
          title={PROJECT_COPY.scheduleEmptyTitle}
          body={PROJECT_COPY.scheduleDetailEmptyBody}
        />
      ) : (
        <ul aria-label={PROJECT_COPY.scheduleTitle}>
          {project.sessions.map((session, index) => (
            <SessionRow
              key={session.id}
              session={session}
              isLastRow={index === project.sessions.length - 1}
              assignments={byUnit.get(session.id) ?? []}
              canEditTeam={project.canEditTeam}
              team={team}
              edit={canEdit ? edit : undefined}
              isLastOfBooked={isLastOfBooked}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function SessionRow({
  session,
  isLastRow,
  assignments,
  canEditTeam,
  team,
  edit,
  isLastOfBooked,
}: Readonly<SessionRowProps>) {
  const menu = edit ? (
    <SessionMenu
      session={session}
      edit={edit}
      isLast={isLastOfBooked}
      hasTeam={assignments.length > 0}
      canEditTeam={canEditTeam}
      team={team}
    />
  ) : null;
  return (
    <ListCardItem
      icon="calendar"
      title={session.name}
      meta={formatSessionRange(session)}
      isLast={isLastRow}
      trailing={
        <SessionTrailing
          session={session}
          assignments={assignments}
          canEditTeam={canEditTeam}
          team={team}
          menu={menu}
        />
      }
    />
  );
}

/** The row's trailing area: the avatar group or the `user-plus` button, then the ⋯ menu (AC-TEAM-026). */
function SessionTrailing({
  session,
  assignments,
  canEditTeam,
  team,
  menu,
}: Readonly<SessionTrailingProps>) {
  function handleManage(): void {
    team?.onManage(session);
  }
  function handleAdd(): void {
    team?.onAdd(session);
  }
  let teamControl = null;
  if (assignments.length > 0) {
    teamControl = (
      <SessionTeamAvatars
        sessionName={session.name}
        assignments={assignments}
        onOpen={handleManage}
      />
    );
  } else if (canEditTeam && team) {
    teamControl = (
      <IconButton
        icon="user-plus"
        size="sm"
        aria-label={PROJECT_COPY.addTeamFor(session.name)}
        onPress={handleAdd}
      />
    );
  }
  if (teamControl === null && menu === null) return null;
  return (
    <div className="flex items-center gap-(--space-2)">
      {teamControl}
      {menu}
    </div>
  );
}

function SessionMenu({
  session,
  edit,
  isLast,
  hasTeam,
  canEditTeam,
  team,
}: Readonly<{
  session: ProjectDetailCardProps["project"]["sessions"][number];
  edit: DetailEditHandlers;
  isLast: boolean;
  hasTeam: boolean;
  canEditTeam: boolean;
  team?: SessionTeamHandlers;
}>) {
  const handleEdit = () => {
    edit.onEditSession(session);
  };
  const handleDelete = () => {
    edit.onDeleteSession(session);
  };
  const handleAdd = () => {
    team?.onAdd(session);
  };
  const handleManage = () => {
    team?.onManage(session);
  };
  let teamAction: SessionTeamAction | undefined;
  if (canEditTeam && team) {
    teamAction = hasTeam
      ? { label: PROJECT_COPY.manageTeam, icon: "users", onSelect: handleManage }
      : { label: PROJECT_COPY.addTeam, icon: "user-plus", onSelect: handleAdd };
  }
  return (
    <SessionRowActions
      name={session.name}
      onEdit={handleEdit}
      onDelete={handleDelete}
      deleteHint={isLast ? PROJECT_COPY.lastSessionHint : undefined}
      isDetail
      teamAction={teamAction}
    />
  );
}

/** Field booking card: the values snapshotted from the service; hidden when the service has none. */
export function ProjectFieldsReadCard(
  props: Readonly<ProjectDetailCardProps & { edit?: DetailEditHandlers }>,
) {
  const { project, edit } = props;
  if (project.fields.length === 0) return null;
  const description = fieldsDescription(props);
  return (
    <SectionCard
      title={PROJECT_COPY.fieldsTitle}
      description={description}
      content="flush"
      actions={
        edit && project.canEditDeal ? (
          <Button variant="secondary" iconLeading="pencil" onPress={edit.onEditFields}>
            {PROJECT_COPY.fieldsEdit}
          </Button>
        ) : null
      }
    >
      <ProjectFacts
        facts={project.fields.map((field) => ({
          label: field.name,
          value: displayBookingValue(field),
        }))}
      />
    </SectionCard>
  );
}
