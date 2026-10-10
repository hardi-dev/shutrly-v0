"use client";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { Stepper } from "@/ui/primitives/stepper/stepper";

import { PhotoThumb } from "../photo-thumb/photo-thumb";
import { REVIEW_COPY as COPY } from "../review-screen/review-screen.copy";
import type { PickNoteBlockProps, PickRowProps } from "./pick-row.types";

function NoteBlock({ note, isEditable, allowsNotes, onNote }: Readonly<PickNoteBlockProps>) {
  if (!allowsNotes || (note === null && !isEditable)) return null;
  const action = (
    <button
      type="button"
      onClick={onNote}
      className="flex w-fit items-center gap-(--space-1-5) text-(length:--font-size-body-sm) font-medium text-(--color-semantic-action-primary)"
    >
      <Icon name={note === null ? "plus" : "pencil"} size="sm" aria-hidden="true" />
      {note === null ? COPY.noteAdd : COPY.noteEdit}
    </button>
  );
  if (note === null) return action;
  return (
    <div className="flex flex-col gap-(--space-2)">
      <div className="flex items-start gap-(--space-3) rounded-(--radius-md) border border-(--component-alert-info-border) bg-(--component-alert-info-background) p-(--space-3)">
        <span className="text-(--component-alert-info-icon)">
          <Icon name="message-square-text" size="sm" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
          <span className="text-(length:--font-size-body-sm) font-semibold text-(--component-alert-info-title)">
            {COPY.noteTitle}
          </span>
          <span className="text-(length:--font-size-caption) break-words whitespace-pre-line text-(--color-semantic-text-secondary)">
            {note}
          </span>
        </span>
      </div>
      {isEditable ? action : null}
    </div>
  );
}

function RowTrailing({
  pick,
  group,
  isEditable,
  maxQuantity,
  onQuantity,
}: Readonly<Omit<PickRowProps, "onNote">>) {
  const { photo } = pick;
  const handleQuantity = (quantity: number) => {
    onQuantity(photo.id, quantity);
  };
  const handleRemove = () => {
    onQuantity(photo.id, 0);
  };
  const isQuantity = group.mode === "QUANTITY";
  if (!isEditable) {
    return isQuantity ? (
      <span className="text-(length:--font-size-body) font-bold text-(--color-semantic-text-primary)">
        {COPY.quantityReadOnly(pick.quantity)}
      </span>
    ) : null;
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-(--space-2)",
        // Phone: the stepper and remove button take their own line so the file name stays readable.
        isQuantity && "max-md:w-full max-md:justify-end",
      )}
    >
      {isQuantity ? (
        <Stepper
          label={COPY.quantityLabel(photo.fileName)}
          value={pick.quantity}
          min={1}
          max={maxQuantity}
          onChange={handleQuantity}
        />
      ) : null}
      <IconButton
        icon="x"
        size="sm"
        aria-label={COPY.remove(photo.fileName)}
        onPress={handleRemove}
      />
    </span>
  );
}

/** One picked photo on Tinjau: thumbnail, name and folder, the print stepper and remove button, and the note with *Ubah catatan* / *Tambah catatan*; read-only after the group is sent (tinjau and lihatpilihan exports, A-29, A-32). @param props - the pick, its group and the handlers @returns the row */
export function PickRow(props: Readonly<PickRowProps>) {
  const { pick, group, isEditable, onNote } = props;
  const { photo } = pick;
  const handleNote = () => {
    onNote(photo.id);
  };
  const meta = photo.missing
    ? COPY.missingMeta
    : photo.folderPath.split("/").join(COPY.folderSeparator);
  return (
    <li className="flex flex-col gap-(--space-3) border-b border-(--color-semantic-border-subtle) px-(--space-4) py-(--space-3) last:border-b-0">
      <div className="flex flex-wrap items-center gap-(--space-3)">
        <PhotoThumb image={photo.thumb} size="lg" />
        <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
          <span className="truncate text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
            {photo.fileName}
          </span>
          <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
            {meta}
          </span>
        </span>
        <RowTrailing {...props} />
      </div>
      <NoteBlock
        note={pick.note}
        isEditable={isEditable}
        allowsNotes={group.allowsPickNotes}
        onNote={handleNote}
      />
    </li>
  );
}
