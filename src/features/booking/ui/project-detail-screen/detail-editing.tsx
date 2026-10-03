"use client";
/* eslint-disable max-lines-per-function -- one place owns which detail edit dialog is open and what each submit sends */

import type { ReactNode } from "react";
import { useState } from "react";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import type { SessionInput } from "@/features/booking/domain/session/session.types";

import { BookingFieldsDialog } from "../booking-fields-dialog/booking-fields-dialog";
import { ProjectConfirmDialog } from "../project-confirm-dialog/project-confirm-dialog";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { DefinitionOption, ProjectEditActions } from "../project-edit/project-edit.types";
import { useProjectEdits } from "../project-edit/use-project-edits";
import { ProjectItemDialog } from "../project-item-dialog/project-item-dialog";
import { SessionDialog } from "../session-dialog/session-dialog";
import type { DetailEditHandlers, EditOpen } from "./project-detail-screen.types";

/** Owns the detail edit dialogs; every submit goes through `use-project-edits` (AC-PRJ-017, 019, 029). */
export function DetailEditing({
  workspaceId,
  project,
  actions,
  definitions,
  addSessionRequest,
  children,
}: Readonly<{
  workspaceId: string;
  project: ProjectDetailView;
  actions: ProjectEditActions;
  definitions: readonly DefinitionOption[];
  /** Counts how often *Konfirmasi booking* asked for a session; each new value opens Tambah sesi. */
  addSessionRequest: number;
  children: (handlers: DetailEditHandlers) => ReactNode;
}>) {
  const edits = useProjectEdits();
  const [open, setOpen] = useState<EditOpen>(null);
  const [handledRequest, setHandledRequest] = useState(addSessionRequest);
  if (handledRequest !== addSessionRequest) {
    setHandledRequest(addSessionRequest);
    setOpen({ kind: "addSession" });
  }
  const close = (isOpen: boolean) => {
    if (!isOpen) setOpen(null);
  };
  const handlers: DetailEditHandlers = {
    onAddItem: () => {
      setOpen({ kind: "addItem" });
    },
    onEditItem: (item) => {
      setOpen({ kind: "editItem", item });
    },
    onRemoveItem: (item) => {
      setOpen({ kind: "removeItem", item });
    },
    onEditFields: () => {
      setOpen({ kind: "fields" });
    },
    onAddSession: () => {
      setOpen({ kind: "addSession" });
    },
    onEditSession: (session) => {
      setOpen({ kind: "editSession", session });
    },
    onDeleteSession: (session) => {
      setOpen({ kind: "deleteSession", session });
    },
  };
  const used = new Set(project.items.map((item) => item.definitionId));
  const saveSession = (session: SessionInput) => {
    const current = open;
    void edits.run(() =>
      current?.kind === "editSession"
        ? actions.updateSessionAction(workspaceId, project.id, current.session.id, session)
        : actions.addSessionAction(workspaceId, project.id, session),
    );
  };
  const confirmRemoveItem = async () => {
    if (open?.kind !== "removeItem") return;
    const item = open.item;
    await edits.run(() => actions.removeItemAction(workspaceId, project.id, item.id));
  };
  const confirmDeleteSession = async () => {
    if (open?.kind !== "deleteSession") return;
    const session = open.session;
    await edits.run(() => actions.deleteSessionAction(workspaceId, project.id, session.id));
  };
  const submitAddItem = (input: { definitionId?: string; value: unknown }) =>
    edits.run(() => actions.addItemAction(workspaceId, project.id, input));
  const submitEditItem = (input: { value: unknown }) =>
    edits.run(() =>
      actions.updateItemAction(
        workspaceId,
        project.id,
        open?.kind === "editItem" ? open.item.id : "",
        {
          value: input.value,
        },
      ),
    );
  const submitFields = (values: unknown) =>
    edits.run(() => actions.updateFieldsAction(workspaceId, project.id, { values }));
  const editedItem = open?.kind === "editItem" ? open.item : undefined;
  const editedSession = open?.kind === "editSession" ? open.session : null;
  return (
    <>
      {children(handlers)}
      {open?.kind === "addItem" ? (
        <ProjectItemDialog
          mode="add"
          isOpen
          onOpenChange={close}
          definitions={definitions.filter((definition) => !used.has(definition.id))}
          onSubmit={submitAddItem}
        />
      ) : null}
      {editedItem ? (
        <ProjectItemDialog
          mode="edit"
          isOpen
          onOpenChange={close}
          item={editedItem}
          onSubmit={submitEditItem}
        />
      ) : null}
      {open?.kind === "removeItem" ? (
        <ProjectConfirmDialog
          isOpen
          onOpenChange={close}
          title={PROJECT_COPY.removeItemTitle(open.item.name)}
          body={PROJECT_COPY.removeItemBody}
          confirmLabel={PROJECT_COPY.removeItemConfirm}
          onConfirm={confirmRemoveItem}
        />
      ) : null}
      {open?.kind === "fields" ? (
        <BookingFieldsDialog
          isOpen
          onOpenChange={close}
          fields={project.fields}
          onSubmit={submitFields}
        />
      ) : null}
      <SessionDialog
        isOpen={open?.kind === "addSession" || open?.kind === "editSession"}
        onOpenChange={close}
        session={editedSession}
        description={PROJECT_COPY.sessionDialogDetailDescription}
        onSave={saveSession}
      />
      {open?.kind === "deleteSession" ? (
        <ProjectConfirmDialog
          isOpen
          onOpenChange={close}
          title={PROJECT_COPY.deleteSessionTitle(open.session.name)}
          body={PROJECT_COPY.deleteSessionBody}
          confirmLabel={PROJECT_COPY.deleteSessionConfirm}
          onConfirm={confirmDeleteSession}
        />
      ) : null}
    </>
  );
}
/* eslint-enable max-lines-per-function -- one place owns which detail edit dialog is open and what each submit sends */
