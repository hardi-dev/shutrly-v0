"use client";

import { useState } from "react";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { ClientShell } from "../client-shell/client-shell";
import { GroupSummary } from "../group-summary/group-summary";
import { PickNoteSheet } from "../pick-note-sheet/pick-note-sheet";
import { PickRow } from "../pick-row/pick-row";
import { ReviewConfirmDialog } from "../review-confirm-dialog/review-confirm-dialog";
import { useReviewChanges } from "../use-review-screen/use-review-changes";
import { useReviewSubmit } from "../use-review-screen/use-review-submit";
import { REVIEW_COPY as COPY } from "./review-screen.copy";
import type {
  ReviewFooterProps,
  ReviewListProps,
  ReviewOverlaysProps,
  ReviewScreenProps,
} from "./review-screen.types";
import { cardMeta, reviewHeader, sendLabelOf, unitOf } from "./review-text";

function ReviewList({ changes, isEditable, onNote }: Readonly<ReviewListProps>) {
  const { state } = changes;
  if (state.picks.length === 0) {
    return (
      <EmptyState
        icon="images"
        placement="in-card"
        title={COPY.emptyTitle}
        body={COPY.emptyBody(state.group.name)}
      />
    );
  }
  return (
    <ul className="px-(--space-3) py-(--space-1)">
      {state.picks.map((pick) => (
        <PickRow
          key={pick.photo.id}
          pick={pick}
          group={state.group}
          isEditable={isEditable}
          maxQuantity={changes.maxQuantityOf(pick)}
          onQuantity={changes.changeQuantity}
          onNote={onNote}
        />
      ))}
    </ul>
  );
}

function ReviewFooter({ changes, submit, pickHref }: Readonly<ReviewFooterProps>) {
  const { group, picks } = changes.state;
  return (
    <div className="flex flex-col-reverse gap-(--space-3) md:flex-row md:justify-end">
      <Button
        variant="secondary"
        size="lg"
        href={pickHref}
        iconLeading="plus"
        className="max-md:w-full"
      >
        {COPY.addMore}
      </Button>
      <Button
        size="lg"
        iconLeading="send"
        isDisabled={picks.length === 0}
        isPending={submit.isSubmitting}
        className="max-md:w-full"
        onPress={submit.send}
      >
        {sendLabelOf(group, picks.length, changes.usage, submit.isSubmitting)}
      </Button>
    </div>
  );
}

function ReviewSummary({ changes, isEditable }: Readonly<Omit<ReviewListProps, "onNote">>) {
  const { group } = changes.state;
  return (
    <GroupSummary
      name={group.name}
      status={group.status}
      limit={group.limit}
      usage={changes.usage}
      unit={group.unit}
      remaining={isEditable ? changes.remaining : undefined}
      progress={group.limit === 0 ? 0 : Math.min(changes.usage / group.limit, 1)}
      className="rounded-(--radius-md) border border-(--color-semantic-border-subtle) bg-(--color-semantic-surface-panel) p-(--space-4)"
    />
  );
}

function ReviewOverlays({
  changes,
  submit,
  actions,
  pickHref,
  noteFor,
  onCloseNote,
}: Readonly<ReviewOverlaysProps>) {
  const { group, picks } = changes.state;
  const notePick = picks.find((pick) => pick.photo.id === noteFor);
  const reload = () => {
    void changes.reload();
  };
  return (
    <>
      {submit.confirmRemaining === null ? null : (
        <ReviewConfirmDialog
          group={group}
          usage={changes.usage}
          remaining={submit.confirmRemaining}
          sendLabel={COPY.send(changes.usage, unitOf(group))}
          pickHref={pickHref}
          isPending={submit.isSubmitting}
          onConfirm={submit.confirm}
          onClose={submit.closeConfirm}
        />
      )}
      {notePick ? (
        <PickNoteSheet
          target={{ groupId: group.id, groupName: group.name, ...notePick }}
          saveNote={actions.setNote}
          onClose={onCloseNote}
          onSaved={changes.applyNote}
          onStale={reload}
        />
      ) : null}
    </>
  );
}

/** Tinjau for an `OPEN` group — the picks with the print stepper, remove and note actions, *Tambah foto lagi* and *Kirim n foto* with the below-limit notice — or the read-only *Lihat pilihan* once it is sent or locked (tinjau and lihatpilihan exports, A-5, A-29, A-32, AC-SEL-008/009/018/021). @param props - gate names, token, the review and the actions @returns the page */
export function ReviewScreen({ gate, token, view, actions }: Readonly<ReviewScreenProps>) {
  const changes = useReviewChanges({ view, token, actions });
  const submit = useReviewSubmit(actions, changes, token);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const { group, picks } = changes.state;
  const isEditable = view.isEditable;
  const pickHref = `/g/${token}/picks/${group.id}`;
  const closeNote = () => {
    setNoteFor(null);
  };
  return (
    <ClientShell gate={gate} width="narrow" header={reviewHeader(group, token, isEditable)}>
      <ReviewSummary changes={changes} isEditable={isEditable} />
      <SectionCard
        title={COPY.cardTitle}
        description={cardMeta(group, picks.length, changes.usage, isEditable)}
        content="flush"
      >
        <ReviewList changes={changes} isEditable={isEditable} onNote={setNoteFor} />
      </SectionCard>
      {isEditable ? <ReviewFooter changes={changes} submit={submit} pickHref={pickHref} /> : null}
      <ReviewOverlays
        changes={changes}
        submit={submit}
        actions={actions}
        pickHref={pickHref}
        noteFor={noteFor}
        onCloseNote={closeNote}
      />
    </ClientShell>
  );
}
