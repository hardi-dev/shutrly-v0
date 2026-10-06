"use client";

import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";

import { PICK_NOTE_MAX } from "@/features/gallery/domain/client-access-limits/client-access-limits";
import { useImageFallback } from "@/ui/hooks/use-image-fallback/use-image-fallback";
import { Button } from "@/ui/primitives/button/button";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { GalleryDialogShell } from "../gallery-dialog-shell/gallery-dialog-shell";
import { PICK_NOTE_COPY as COPY } from "./pick-note-sheet.copy";
import type { NotePhotoProps, PickNoteSheetProps, SaveOutcome } from "./pick-note-sheet.types";

const FORM_ID = "pick-note-form";

function NotePhoto({ photo, groupName }: Readonly<NotePhotoProps>) {
  const image = useImageFallback(photo.thumb.src, photo.thumb.fallbackSrc);
  return (
    <div className="flex items-center gap-(--space-3)">
      <span className="size-12 shrink-0 overflow-hidden rounded-(--radius-sm) bg-(--component-photo-tile-image-background)">
        {image.src === null ? null : (
          // eslint-disable-next-line @next/next/no-img-element -- the private media route must not go through the image optimiser
          <img
            src={image.src}
            alt=""
            referrerPolicy="no-referrer"
            onError={image.onError}
            className="size-full object-cover"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
        <span className="truncate text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
          {photo.fileName}
        </span>
        <span className="truncate text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {COPY.pickedFor(groupName)}
        </span>
      </span>
    </div>
  );
}

function errorFor(outcome: SaveOutcome): string | null {
  if (outcome === "FAILED") return COPY.failed;
  if (outcome === "SIGNED_OUT" || outcome.ok) return null;
  if (outcome.code === "TOO_LONG") return COPY.tooLong(PICK_NOTE_MAX);
  if (outcome.code === "RATE_LIMITED") return COPY.rateLimited;
  return outcome.code === "INVALID" ? COPY.failed : null;
}

function usePickNoteForm(props: Readonly<PickNoteSheetProps>) {
  const { target, saveNote, onClose, onSaved, onStale } = props;
  const router = useRouter();
  const [text, setText] = useState(target.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const count = Array.from(text.trim()).length;
  const isTooLong = count > PICK_NOTE_MAX;
  const save = async () => {
    setIsPending(true);
    const input = { groupId: target.groupId, photoId: target.photo.id, note: text };
    const outcome: SaveOutcome = await saveNote(input)
      .then((result) => ("kind" in result ? "SIGNED_OUT" : result))
      .catch(() => "FAILED" as const);
    setIsPending(false);
    if (outcome === "SIGNED_OUT") router.refresh();
    else if (outcome !== "FAILED" && outcome.ok) {
      onSaved(target.photo.id, outcome.note);
      onClose();
    } else if (errorFor(outcome) === null) {
      onClose();
      onStale();
    } else setError(errorFor(outcome));
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isTooLong) void save();
  };
  const handleChange = (value: string) => {
    setText(value);
    setError(null);
  };
  const shownError = isTooLong ? COPY.tooLong(PICK_NOTE_MAX) : (error ?? undefined);
  return { text, count, isTooLong, isPending, shownError, handleSubmit, handleChange };
}

/** Writes, changes or clears the note on one pick: Modal MD on desktop, Bottom Sheet Form on phones, a 500-character counter, *Batal* / *Simpan catatan* (pilih-tulis-catatan, A-32, AC-SEL-021). @param props - the pick, the save action and callbacks @returns the sheet */
export function PickNoteSheet(props: Readonly<PickNoteSheetProps>) {
  const { target, onClose } = props;
  const form = usePickNoteForm(props);
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };
  const renderPrimary = (isMobile: boolean) => (
    <Button
      type="submit"
      form={FORM_ID}
      size={isMobile ? "lg" : "md"}
      isPending={form.isPending}
      isDisabled={form.isTooLong}
      className="max-md:w-full"
    >
      {COPY.save}
    </Button>
  );
  return (
    <GalleryDialogShell
      isOpen
      onOpenChange={handleOpenChange}
      title={COPY.title(target.photo.fileName)}
      description={COPY.description}
      size="md"
      isPending={form.isPending}
      renderPrimary={renderPrimary}
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={form.handleSubmit}
        className="flex flex-col gap-(--space-4)"
      >
        <NotePhoto photo={target.photo} groupName={target.groupName} />
        <Textarea
          aria-label={COPY.label}
          value={form.text}
          onChange={form.handleChange}
          rows={3}
          helperText={COPY.helper(form.count, PICK_NOTE_MAX)}
          errorMessage={form.shownError}
        />
      </form>
    </GalleryDialogShell>
  );
}
