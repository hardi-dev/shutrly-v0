"use client";

import { useTranslations } from "next-intl";

import { lockIntentFor } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import { LockSelectionDialog } from "../lock-selection-dialog/lock-selection-dialog";
import { PhotoThumb } from "../photo-thumb/photo-thumb";
import { groupMeta, groupStatusChip } from "../selection-owner-text/selection-owner-text";
import { useLockSelection } from "../use-lock-selection/use-lock-selection";
import { SELECTION_GROUPS_SCREEN_COPY_NAMESPACE } from "./selection-groups-screen.copy";
import type {
  GroupCardProps,
  GroupsBannerProps,
  SelectionGroupsScreenProps,
} from "./selection-groups-screen.types";

function GroupsBanner({ page }: Readonly<GroupsBannerProps>) {
  const t = useTranslations(SELECTION_GROUPS_SCREEN_COPY_NAMESPACE);
  const sent = page.groups.filter((group) => group.status === "SUBMITTED");
  if (sent.length > 0) {
    const names = sent.map((group) => group.name).join(t("namesJoin"));
    return (
      <Alert
        tone="warning"
        title={t("sentBannerTitle", { names: names })}
        body={t("sentBannerBody")}
      />
    );
  }
  if (page.state === "OPEN") {
    return <Alert tone="info" title={t("waitingTitle")} body={t("waitingBody")} />;
  }
  return null;
}

function GroupActions({ workspaceId, projectId, group, lock }: Readonly<GroupCardProps>) {
  const t = useTranslations(SELECTION_GROUPS_SCREEN_COPY_NAMESPACE);
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
        {t("viewPicks")}
      </Button>
      {lockIntentFor(group) === "LOCK" ? (
        <Button iconLeading="lock" onPress={request("LOCK")}>
          {t("lockPicks")}
        </Button>
      ) : null}
      {lockIntentFor(group) === "CLOSE" ? (
        <Button variant="secondary" onPress={request("CLOSE")}>
          {t("closePicks")}
        </Button>
      ) : null}
    </div>
  );
}

function GroupCard(props: Readonly<GroupCardProps>) {
  const t = useTranslations(SELECTION_GROUPS_SCREEN_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const { workspaceId, group } = props;
  return (
    <SectionCard
      title={group.name}
      description={groupMeta(t, group, true, locale)}
      actions={<StatusChip {...groupStatusChip(t, group.status)} hasDot />}
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
              {t("moreThumbs", { count: group.preview.more })}
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
  const t = useTranslations(SELECTION_GROUPS_SCREEN_COPY_NAMESPACE);
  const lock = useLockSelection({ workspaceId, projectId, lockAction });
  if (page.state === "NO_ITEMS" || page.state === "NOT_PUBLISHED") {
    return (
      <main className="mx-auto w-full max-w-(--size-content-max)">
        <EmptyState
          icon="images"
          title={t("cardTitle")}
          body={page.state === "NO_ITEMS" ? t("cardNoItems") : t("cardNotPublishedNote")}
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
