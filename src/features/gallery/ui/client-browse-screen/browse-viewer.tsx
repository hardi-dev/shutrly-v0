"use client";

import { useState } from "react";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { ClientPhotoViewer } from "../client-photo-viewer/client-photo-viewer";
import { PickNoteSheet } from "../pick-note-sheet/pick-note-sheet";
import type { PhotoTarget } from "../use-pick-targets/use-pick-targets.types";
import { ViewerPickActions, ViewerPickBar } from "../viewer-pick-actions/viewer-pick-actions";
import { pickedInLine } from "../viewer-pick-actions/viewer-pick-text";
import { CLIENT_BROWSE_COPY as COPY } from "./client-browse-screen.copy";
import type { BrowseViewerProps, NoteFor } from "./client-browse-screen.types";

/** The viewer's *Unduh foto* (F-19) with *Pilih untuk…* and *Catatan* when the page has groups (A-30). */
function useViewerActions(
  { downloadUrlOf }: Readonly<BrowseViewerProps>,
  handle: BrowseViewerProps["handle"],
  openNote: (photo: ClientPhotoView) => (target: PhotoTarget) => void,
  hasGroups: boolean,
) {
  const download = (photo: ClientPhotoView) =>
    photo.missing ? null : (
      <Button variant="secondary" iconLeading="download" href={downloadUrlOf(photo.id)}>
        {COPY.downloadPhoto}
      </Button>
    );
  const renderActions = (photo: ClientPhotoView) => (
    <div className="flex items-center gap-(--space-2)">
      {download(photo)}
      {hasGroups ? (
        <ViewerPickActions photo={photo} handle={handle} onNote={openNote(photo)} />
      ) : null}
    </div>
  );
  const renderFooter = (photo: ClientPhotoView) => (
    <div className="flex flex-col">
      {hasGroups ? <ViewerPickBar photo={photo} handle={handle} onNote={openNote(photo)} /> : null}
      <div className="flex justify-end px-(--space-4) pt-(--space-3)">{download(photo)}</div>
    </div>
  );
  return { renderActions, renderFooter };
}

/** The *Semua foto* viewer: *Unduh foto* always (F-19); read-only picks without groups (A-31), otherwise with *Pilih untuk…* and *Catatan* in the top bar on desktop or the pick bar on phones, and *Dipilih di: …* as the meta line (pratinjau exports, A-30, A-32, AC-SEL-019). @param props - photos, the open index, handlers, the groups and picks and the pick actions @returns the viewer */
export function BrowseViewer(props: Readonly<BrowseViewerProps>) {
  const { photos, index, onIndexChange, onClose, handle, pickActions } = props;
  const isMobile = useMobileViewport();
  const [noteFor, setNoteFor] = useState<NoteFor | null>(null);
  const hasGroups = handle.targets.groups.length > 0;
  const openNote = (photo: ClientPhotoView) => (target: PhotoTarget) => {
    setNoteFor({ photo, target });
  };
  const { renderActions, renderFooter } = useViewerActions(props, handle, openNote, hasGroups);
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
        renderActions={isMobile ? undefined : renderActions}
        renderFooter={isMobile ? renderFooter : undefined}
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
