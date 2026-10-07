"use client";

import { useState } from "react";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_BROWSE_COPY } from "../client-browse-screen/client-browse-screen.copy";
import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientShell } from "../client-shell/client-shell";
import type { ClientPageHeader } from "../client-shell/client-shell.types";
import { GroupSummary } from "../group-summary/group-summary";
import { PickNoteSheet } from "../pick-note-sheet/pick-note-sheet";
import { usePickGrid, usePickSelection } from "../use-pick-screen/use-pick-screen";
import type { PickFilter } from "../use-pick-screen/use-pick-screen.types";
import { PickGrid } from "./pick-grid";
import { PICK_COPY as COPY } from "./pick-screen.copy";
import type {
  PickFilterControlProps,
  PickPhotosCardProps,
  PickScreenProps,
  PickSummaryProps,
} from "./pick-screen.types";
import { pickSubtitle } from "./pick-text";

const FILTERS = [
  { id: "ALL", label: COPY.filterAll },
  { id: "PICKED", label: COPY.filterPicked },
] as const;

function PickFilterControl({ filter, onChange, className }: Readonly<PickFilterControlProps>) {
  const handleChange = (id: string) => {
    onChange(id === "PICKED" ? "PICKED" : "ALL");
  };
  return (
    <SegmentedControl
      label={COPY.filterLabel}
      options={FILTERS}
      selectedId={filter}
      onChange={handleChange}
      isFullWidth={className !== undefined}
      className={className}
    />
  );
}

function PickSummary({ selection, reviewHref }: Readonly<PickSummaryProps>) {
  const { group } = selection.state;
  return (
    <GroupSummary
      name={group.name}
      status={group.status}
      limit={group.limit}
      usage={selection.usage}
      unit={group.unit}
      progress={group.limit === 0 ? 0 : Math.min(selection.usage / group.limit, 1)}
      isFull={selection.isFull}
      action={<Button href={reviewHref}>{COPY.review}</Button>}
      className="rounded-(--radius-md) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-4)"
    />
  );
}

function PhotosCard({ selection, grid, onNote }: Readonly<PickPhotosCardProps>) {
  const [filter, setFilter] = useState<PickFilter>("ALL");
  return (
    <SectionCard
      title={COPY.cardTitle}
      description={COPY.cardMeta(grid.state.total)}
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
  const retry = () => {
    void grid.retry();
  };
  if (!grid.state.hasFailed) return null;
  return (
    <Alert
      tone="danger"
      title={CLIENT_BROWSE_COPY.failedTitle}
      body={CLIENT_BROWSE_COPY.failedBody}
      action={{ label: CLIENT_BROWSE_COPY.retry, onAction: retry }}
    />
  );
}

function pickHeader(group: PickGroupView, home: string): ClientPageHeader {
  return {
    title: group.name,
    subtitle: pickSubtitle(group),
    breadcrumbs: [{ label: CLIENT_COPY.home, href: home }, { label: group.name }],
    back: { href: home, label: CLIENT_COPY.home },
  };
}

/** The client's Pilih screen for one group: the limit alert, the group summary with *Tinjau*, the *Semua foto / Dipilih* filter and a grid where one tap picks or un-picks, with *Catatan* on picked tiles (pilih exports, A-7, A-25, A-27, A-32). @param props - gate names, token, the group view, the first grid page and the actions @returns the page */
export function PickScreen({ gate, token, view, initialPage, actions }: Readonly<PickScreenProps>) {
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
    <ClientShell gate={gate} width="wide" header={pickHeader(group, home)}>
      {selection.isFull ? (
        <Alert
          tone="warning"
          live
          title={COPY.limitTitle}
          body={COPY.limitBody(group.name, selection.usage, group.limit)}
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
