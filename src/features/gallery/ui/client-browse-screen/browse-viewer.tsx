"use client";

import { useState } from "react";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";

import { ClientPhotoViewer } from "../client-photo-viewer/client-photo-viewer";
import { PickNoteSheet } from "../pick-note-sheet/pick-note-sheet";
import { usePickTargets } from "../use-pick-targets/use-pick-targets";
import type { PhotoTarget } from "../use-pick-targets/use-pick-targets.types";
import { ViewerPickActions, ViewerPickBar } from "../viewer-pick-actions/viewer-pick-actions";
import { pickedInLine } from "../viewer-pick-actions/viewer-pick-text";
import type { BrowseViewerProps, NoteFor } from "./client-browse-screen.types";

/** The *Semua foto* viewer: read-only without groups (A-31), otherwise with *Pilih untuk…* and *Catatan* in the top bar on desktop or the pick bar on phones, and *Dipilih di: …* as the meta line (pratinjau exports, A-30, A-32, AC-SEL-019). @param props - photos, the open index, handlers, the groups and picks and the pick actions @returns the viewer */
export function BrowseViewer(props: Readonly<BrowseViewerProps>) {
  const { photos, index, onIndexChange, onClose, targets, pickActions } = props;
  const handle = usePickTargets(targets, pickActions);
  const isMobile = useMobileViewport();
  const [noteFor, setNoteFor] = useState<NoteFor | null>(null);
  const hasGroups = handle.targets.groups.length > 0;
  const openNote = (photo: ClientPhotoView) => (target: PhotoTarget) => {
    setNoteFor({ photo, target });
  };
  const renderActions = (photo: ClientPhotoView) => (
    <ViewerPickActions photo={photo} handle={handle} onNote={openNote(photo)} />
  );
  const renderFooter = (photo: ClientPhotoView) => (
    <ViewerPickBar photo={photo} handle={handle} onNote={openNote(photo)} />
  );
  const metaOf = (photo: ClientPhotoView) => pickedInLine(handle.targetsOf(photo.id));
  const closeNote = () => {
    setNoteFor(null);
  };
  const reload = () => {
    void handle.reload();
  };
  return (
    <>
      <ClientPhotoViewer
        photos={photos}
        index={index}
        onIndexChange={onIndexChange}
        onClose={onClose}
        renderActions={hasGroups && !isMobile ? renderActions : undefined}
        renderFooter={hasGroups && isMobile ? renderFooter : undefined}
        metaOf={hasGroups ? metaOf : undefined}
      />
      {noteFor?.target.pick ? (
        <PickNoteSheet
          target={{
            groupId: noteFor.target.group.id,
            groupName: noteFor.target.group.name,
            photo: noteFor.photo,
            note: noteFor.target.pick.note,
          }}
          saveNote={pickActions.setNote}
          onClose={closeNote}
          onSaved={handle.applyNote.bind(null, noteFor.target.group.id)}
          onStale={reload}
        />
      ) : null}
    </>
  );
}
