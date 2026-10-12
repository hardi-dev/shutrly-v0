"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { Button } from "@/ui/primitives/button/button";

import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { GroupSummary } from "../group-summary/group-summary";
import { PickNoteSheet } from "../pick-note-sheet/pick-note-sheet";
import { usePickGrid, usePickSelection } from "../use-pick-screen/use-pick-screen";
import type { PickFilter } from "../use-pick-screen/use-pick-screen.types";
import { PickGrid } from "./pick-grid";
import {
  PICK_BROWSE_NAMESPACE,
  PICK_COPY_NAMESPACE,
  PICK_SHARED_NAMESPACE,
} from "./pick-screen.copy";
import type {
  PickFilterControlProps,
  PickPhotosCardProps,
  PickScreenProps,
  PickSummaryProps,
} from "./pick-screen.types";
import { pickSubtitle, type PickTranslate } from "./pick-text";

function PickFilterControl({ filter, onChange, className }: Readonly<PickFilterControlProps>) {
  const t = useTranslations(PICK_COPY_NAMESPACE);
  const handleChange = (id: string) => {
    onChange(id === "PICKED" ? "PICKED" : "ALL");
  };
  return (
    <SegmentedControl
      label={t("filterLabel")}
      options={[
        { id: "ALL", label: t("filterAll") },
        { id: "PICKED", label: t("filterPicked") },
      ]}
      selectedId={filter}
      onChange={handleChange}
      isFullWidth={className !== undefined}
      className={className}
    />
  );
}

function PickSummary({ selection, reviewHref }: Readonly<PickSummaryProps>) {
  const t = useTranslations(PICK_COPY_NAMESPACE);
  const shared = useTranslations(PICK_SHARED_NAMESPACE);
  const { group } = selection.state;
  return (
    <GroupSummary
      name={group.name}
      status={group.status}
      limit={group.limit}
      usage={selection.usage}
      unit={group.unit ?? shared("defaultUnit")}
      progress={group.limit === 0 ? 0 : Math.min(selection.usage / group.limit, 1)}
      isFull={selection.isFull}
      action={<Button href={reviewHref}>{t("review")}</Button>}
      className="rounded-(--radius-md) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-4)"
    />
  );
}

function PhotosCard({ selection, grid, onNote }: Readonly<PickPhotosCardProps>) {
  const t = useTranslations(PICK_COPY_NAMESPACE);
  const [filter, setFilter] = useState<PickFilter>("ALL");
  return (
    <SectionCard
      title={t("cardTitle")}
      description={t("cardMeta", { total: grid.state.total })}
      actions={
        <div className="hidden md:block">
          <PickFilterControl filter={filter} onChange={setFilter} />
        </div>
      }
    >
      <PickFilterControl filter={filter} onChange={setFilter} className="md:hidden" />
      <PickGrid filter={filter} selection={selection} grid={grid} onNote={onNote} />
    </SectionCard>
  );
}

function GridFailed({ grid }: Readonly<Pick<PickPhotosCardProps, "grid">>) {
  const t = useTranslations(PICK_BROWSE_NAMESPACE);
  const retry = () => {
    void grid.retry();
  };
  if (!grid.state.hasFailed) return null;
  return (
    <Alert
      tone="danger"
      title={t("failedTitle")}
      body={t("failedBody")}
      action={{ label: t("retry"), onAction: retry }}
    />
  );
}

function pickHeader(
  t: PickTranslate,
  shared: ReturnType<typeof useTranslations>,
  group: PickGroupView,
  home: string,
): ClientPageHeader {
  const unit = group.unit ?? shared("defaultUnit");
  return {
    title: group.name,
    subtitle: pickSubtitle(t, group, unit),
    breadcrumbs: [{ label: shared("home"), href: home }, { label: group.name }],
    back: { href: home, label: shared("home") },
  };
}

/** The client's Pilih screen for one group: the limit alert, the group summary with *Tinjau*, the *Semua foto / Dipilih* filter and a grid where one tap picks or un-picks, with *Catatan* on picked tiles (pilih exports, A-7, A-25, A-27, A-32). @param props - gate names, token, the group view, the first grid page and the actions @returns the page */
export function PickScreen({ gate, token, view, initialPage, actions }: Readonly<PickScreenProps>) {
  const t = useTranslations(PICK_COPY_NAMESPACE);
  const shared = useTranslations(PICK_SHARED_NAMESPACE);
  const selection = usePickSelection({ view, token, actions });
  const grid = usePickGrid(actions, initialPage);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const { group } = selection.state;
  const notePick = noteFor === null ? undefined : selection.state.picks.get(noteFor);
  const home = `/g/${token}`;
  const closeNote = () => {
    setNoteFor(null);
  };
  const reload = () => {
    void selection.reload();
  };
  return (
    <ClientShell gate={gate} width="wide" header={pickHeader(t, shared, group, home)}>
      {selection.isFull ? (
        <Alert
          tone="warning"
          live
          title={t("limitTitle")}
          body={t("limitBody", { name: group.name, usage: selection.usage, limit: group.limit })}
        />
      ) : null}
      <PickSummary selection={selection} reviewHref={`${home}/picks/${group.id}/review`} />
      <GridFailed grid={grid} />
      <PhotosCard selection={selection} grid={grid} onNote={setNoteFor} />
      {notePick ? (
        <PickNoteSheet
          target={{ groupId: group.id, groupName: group.name, ...notePick }}
          saveNote={actions.setNote}
          onClose={closeNote}
          onSaved={selection.applyNote}
          onStale={reload}
        />
      ) : null}
    </ClientShell>
  );
}
