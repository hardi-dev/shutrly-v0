"use client";

import { useTranslations } from "next-intl";

import { formatPickList } from "@/features/gallery/domain/pick-list/pick-list";
import { lockIntentFor } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { LockSelectionDialog } from "../lock-selection-dialog/lock-selection-dialog";
import { OwnerPickTile } from "../owner-pick-tile/owner-pick-tile";
import { groupStatusChip, unitOfOwnerGroup } from "../selection-owner-text/selection-owner-text";
import { useLockSelection } from "../use-lock-selection/use-lock-selection";
import { SELECTION_GROUP_SCREEN_COPY_NAMESPACE } from "./selection-group-screen.copy";
import type {
  DetailActionsProps,
  DetailAlertsProps,
  FactProps,
  PicksCardProps,
  SelectionGroupScreenProps,
} from "./selection-group-screen.types";
import { picksMeta, timeFact } from "./selection-group-text";

function DetailActions({ detail, lock }: Readonly<DetailActionsProps>) {
  const t = useTranslations(SELECTION_GROUP_SCREEN_COPY_NAMESPACE);
  const { group } = detail;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatPickList(group.mode, detail.picks));
      showToast({ tone: "success", title: t("copiedTitle") });
    } catch {
      showToast({ tone: "danger", title: t("copyFailedTitle"), body: t("copyFailedBody") });
    }
  };
  const handleCopy = () => {
    void copy();
  };
  const handleLock = () => {
    lock.request({ group, intent: "LOCK" });
  };
  const handleClose = () => {
    lock.request({ group, intent: "CLOSE" });
  };
  return (
    <div className="flex flex-wrap items-center gap-(--space-2) md:justify-end">
      <Button
        variant="secondary"
        iconLeading="copy"
        isDisabled={detail.picks.length === 0}
        onPress={handleCopy}
      >
        {t("copyNames")}
      </Button>
      {lockIntentFor(group) === "LOCK" ? (
        <Button iconLeading="lock" onPress={handleLock}>
          {t("lockPicks")}
        </Button>
      ) : null}
      {lockIntentFor(group) === "CLOSE" ? (
        <Button variant="secondary" onPress={handleClose}>
          {t("closePicks")}
        </Button>
      ) : null}
    </div>
  );
}

function DetailAlerts({ detail }: Readonly<DetailAlertsProps>) {
  const t = useTranslations(SELECTION_GROUP_SCREEN_COPY_NAMESPACE);
  return (
    <>
      {detail.group.status === "OPEN" ? (
        <Alert tone="info" title={t("openAlertTitle")} body={t("openAlertBody")} />
      ) : null}
      {detail.missingCount > 0 ? (
        <Alert
          tone="warning"
          title={t("missingTitle", { count: detail.missingCount })}
          body={t("missingBody")}
        />
      ) : null}
    </>
  );
}

function Fact({ label, children }: Readonly<FactProps>) {
  return (
    <div className="flex flex-col gap-(--space-1)">
      <span className="text-(length:--font-size-label) font-semibold text-(--color-semantic-text-secondary)">
        {label}
      </span>
      <span className="text-(length:--font-size-subtitle) font-bold text-(--color-semantic-text-primary)">
        {children}
      </span>
    </div>
  );
}

function SummaryCard({ detail }: Readonly<DetailAlertsProps>) {
  const t = useTranslations(SELECTION_GROUP_SCREEN_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const { group } = detail;
  return (
    <SectionCard title={t("summaryTitle")}>
      <div className="flex flex-wrap gap-x-(--space-10) gap-y-(--space-4)">
        <Fact label={t("summaryStatus")}>
          <StatusChip {...groupStatusChip(t, group.status)} hasDot />
        </Fact>
        <Fact label={t("summaryUsed")}>
          {t("usage", { usage: group.usage, limit: group.limit, unit: unitOfOwnerGroup(t, group) })}
        </Fact>
        <Fact label={t("summaryTime")}>{timeFact(t, detail, locale)}</Fact>
        {group.noteCount > 0 ? (
          <Fact label={t("summaryNotes")}>{t("notesPhotos", { count: group.noteCount })}</Fact>
        ) : null}
      </div>
    </SectionCard>
  );
}

function PicksCard({ workspaceId, detail }: Readonly<PicksCardProps>) {
  const t = useTranslations(SELECTION_GROUP_SCREEN_COPY_NAMESPACE);
  const { group, picks } = detail;
  return (
    <SectionCard title={t("picksTitle")} description={picksMeta(t, detail)}>
      {picks.length === 0 ? (
        <EmptyState
          icon="images"
          placement="in-card"
          title={t("emptyTitle")}
          body={t("emptyBody")}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-(--space-4) md:grid-cols-4">
          {picks.map((pick) => (
            <OwnerPickTile
              key={pick.photoId}
              workspaceId={workspaceId}
              pick={pick}
              mode={group.mode}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** The Owner's page for one group: *Salin nama file* and the lock actions, the open and missing-photo alerts, the summary (status, usage, time, notes) and the picks in a 4-column grid, 1 column on phones, each with its note (owner-2 exports, A-28, A-34, AC-SEL-010/011/015). @param props - workspace, project, the group detail and the lock action @returns the page content */
export function SelectionGroupScreen({
  workspaceId,
  projectId,
  detail,
  lockAction,
}: Readonly<SelectionGroupScreenProps>) {
  const lock = useLockSelection({ workspaceId, projectId, lockAction });
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-max) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      <DetailActions detail={detail} lock={lock} />
      <DetailAlerts detail={detail} />
      <SummaryCard detail={detail} />
      <PicksCard workspaceId={workspaceId} detail={detail} />
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
