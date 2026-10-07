"use client";

import { lockIntentFor } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import { Alert } from "@/ui/patterns/alert/alert";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import { LockSelectionDialog } from "../lock-selection-dialog/lock-selection-dialog";
import { PhotoThumb } from "../photo-thumb/photo-thumb";
import { SELECTION_OWNER_COPY as COPY } from "../selection-owner-text/selection-owner.copy";
import { groupMeta, groupStatusChip } from "../selection-owner-text/selection-owner-text";
import { useLockSelection } from "../use-lock-selection/use-lock-selection";
import type {
  GroupCardProps,
  GroupsBannerProps,
  SelectionGroupsScreenProps,
} from "./selection-groups-screen.types";

function GroupsBanner({ page }: Readonly<GroupsBannerProps>) {
  const sent = page.groups.filter((group) => group.status === "SUBMITTED");
  if (sent.length > 0) {
    const names = sent.map((group) => group.name).join(COPY.namesJoin);
    return <Alert tone="warning" title={COPY.sentBannerTitle(names)} body={COPY.sentBannerBody} />;
  }
  if (page.state === "OPEN") {
    return <Alert tone="info" title={COPY.waitingTitle} body={COPY.waitingBody} />;
  }
  return null;
}

function GroupActions({ workspaceId, projectId, group, lock }: Readonly<GroupCardProps>) {
  const request = (intent: "LOCK" | "CLOSE") => () => {
    lock.request({ group, intent });
  };
  return (
    <div className="flex flex-wrap items-center gap-(--space-2)">
      <Button
        variant="secondary"
        iconLeading="eye"
        href={`/w/${workspaceId}/projects/${projectId}/gallery/picks/${group.id}`}
      >
        {COPY.viewPicks}
      </Button>
      {lockIntentFor(group) === "LOCK" ? (
        <Button iconLeading="lock" onPress={request("LOCK")}>
          {COPY.lockPicks}
        </Button>
      ) : null}
      {lockIntentFor(group) === "CLOSE" ? (
        <Button variant="secondary" onPress={request("CLOSE")}>
          {COPY.closePicks}
        </Button>
      ) : null}
    </div>
  );
}

function GroupCard(props: Readonly<GroupCardProps>) {
  const { workspaceId, group } = props;
  return (
    <SectionCard
      title={group.name}
      description={groupMeta(group, true)}
      actions={<StatusChip {...groupStatusChip(group.status)} hasDot />}
    >
      <div className="flex flex-col gap-(--space-4)">
        <ul className="flex flex-wrap items-center gap-(--space-2)">
          {group.preview.photoIds.map((photoId) => (
            <li key={photoId}>
              <PhotoThumb
                image={{ src: galleryMediaUrl(workspaceId, photoId, "thumb") }}
                size="md"
              />
            </li>
          ))}
          {group.preview.more > 0 ? (
            <li className="text-(length:--font-size-body-sm) font-medium text-(--color-semantic-text-secondary)">
              {COPY.moreThumbs(group.preview.more)}
            </li>
          ) : null}
        </ul>
        <GroupActions {...props} />
      </div>
    </SectionCard>
  );
}

/** The Owner's *Pilihan klien* page: a banner for groups to review or a waiting notice, and one card per group with its photo strip, *Lihat pilihan*, *Kunci pilihan* (a sent group) or *Tutup pilihan* (an open one) (owner-1 exports, A-34, AC-SEL-010/011). @param props - workspace, project, the page view and the lock action @returns the page content */
export function SelectionGroupsScreen({
  workspaceId,
  projectId,
  page,
  lockAction,
}: Readonly<SelectionGroupsScreenProps>) {
  const lock = useLockSelection({ workspaceId, projectId, lockAction });
  if (page.state === "NO_ITEMS" || page.state === "NOT_PUBLISHED") {
    return (
      <main className="mx-auto w-full max-w-(--size-content-max)">
        <EmptyState
          icon="images"
          title={COPY.cardTitle}
          body={page.state === "NO_ITEMS" ? COPY.cardNoItems : COPY.cardNotPublishedNote}
        />
      </main>
    );
  }
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-max) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <GroupsBanner page={page} />
      {page.groups.map((group) => (
        <GroupCard
          key={group.id}
          workspaceId={workspaceId}
          projectId={projectId}
          group={group}
          lock={lock}
        />
      ))}
      {lock.target ? (
        <LockSelectionDialog
          target={lock.target}
          isPending={lock.isPending}
          onConfirm={lock.confirm}
          onClose={lock.close}
        />
      ) : null}
    </main>
  );
}
