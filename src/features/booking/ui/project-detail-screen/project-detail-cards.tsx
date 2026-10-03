import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { formatSessionRange } from "@/features/booking/domain/session/session";
import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { PackageItemsCard } from "../package-items-card/package-items-card";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { displayBookingValue } from "./booking-value-display";
import type { ProjectDetailCardProps } from "./project-detail-screen.types";
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
          { label: PROJECT_COPY.infoPrice, value: formatIdr(project.agreedPrice) },
          { label: PROJECT_COPY.infoNotes, value: project.notes },
        ]}
      />
    </SectionCard>
  );
}

/** Package card: the items copied from the service, read only here. */
export function ProjectPackageCard({ project, isMobile }: Readonly<ProjectDetailCardProps>) {
  const description =
    lockedDescription(project) ??
    (isMobile
      ? PROJECT_COPY.packageDescriptionDetailMobile
      : PROJECT_COPY.packageDescriptionDetailDesktop(project.service.name));
  return (
    <PackageItemsCard
      serviceName={project.service.name}
      description={description}
      isMobile={isMobile}
      items={project.items.map((item) => ({ ...item, definitionName: item.name }))}
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

/** Schedule card: sessions in date order, or an empty state while there are none. */
export function ProjectScheduleCard(props: Readonly<ProjectDetailCardProps>) {
  const { project } = props;
  const description = scheduleDescription(props);
  return (
    <SectionCard title={PROJECT_COPY.scheduleTitle} description={description} content="flush">
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
            <ListCardItem
              key={session.id}
              icon="calendar"
              title={session.name}
              meta={formatSessionRange(session)}
              isLast={index === project.sessions.length - 1}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** Field booking card: the values snapshotted from the service; hidden when the service has none. */
export function ProjectFieldsReadCard(props: Readonly<ProjectDetailCardProps>) {
  const { project } = props;
  if (project.fields.length === 0) return null;
  const description = fieldsDescription(props);
  return (
    <SectionCard title={PROJECT_COPY.fieldsTitle} description={description} content="flush">
      <ProjectFacts
        facts={project.fields.map((field) => ({
          label: field.name,
          value: displayBookingValue(field),
        }))}
      />
    </SectionCard>
  );
}
