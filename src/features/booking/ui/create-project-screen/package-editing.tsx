"use client";
/* eslint-disable max-lines-per-function -- one place owns which package dialog is open and what each submit does */

import { useState } from "react";

import type { ActiveDefinition } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import { validateItemList } from "@/features/booking/domain/project-items/project-items";

import { PackageItemsCard } from "../package-items-card/package-items-card";
import type { PackageCardItem } from "../package-items-card/package-items-card.types";
import { ProjectConfirmDialog } from "../project-confirm-dialog/project-confirm-dialog";
import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SubmitErrors } from "../project-edit/project-edit.types";
import { ProjectItemDialog } from "../project-item-dialog/project-item-dialog";
import type { CreateProjectState } from "../use-create-project-form/use-create-project-form.types";
import type { PackageEditOpen } from "./create-project-screen.types";

function checkValue(
  definitionId: string,
  rules: { valueType: "NUMBER" | "RANGE"; selectionRequired: boolean },
  value: PackageValue,
): { value: PackageValue } | { errors: SubmitErrors } {
  const checked = validateItemList([{ definitionId, value }], { [definitionId]: rules });
  const errors = Object.fromEntries(
    Object.entries(checked.errors).map(([path, problem]) => [
      path.replace(/^items\.\d+\./, ""),
      problem,
    ]),
  );
  const first = checked.values.at(0);
  if (Object.keys(errors).length > 0 || !first) return { errors };
  return { value: first };
}

/** The create form's package: Tambah item, Ubah nilai and Hapus change only the form's draft (AC-PRJ-030). */
export function PackageEditing({
  state,
  serviceName,
  definitions,
  isMobile,
}: Readonly<{
  state: CreateProjectState;
  serviceName: string;
  definitions: readonly ActiveDefinition[];
  isMobile: boolean;
}>) {
  const [open, setOpen] = useState<PackageEditOpen>(null);
  const close = (isOpen: boolean) => {
    if (!isOpen) setOpen(null);
  };
  const draftOf = (item: PackageCardItem) =>
    state.items.find((candidate) => candidate.definitionId === item.definitionId);
  const edit = {
    onAdd: () => {
      setOpen({ kind: "add" });
    },
    onEdit: (item: PackageCardItem) => {
      const found = draftOf(item);
      if (found) setOpen({ kind: "edit", item: found });
    },
    onRemove: (item: PackageCardItem) => {
      const found = draftOf(item);
      if (found) setOpen({ kind: "remove", item: found });
    },
  };
  const used = new Set(state.items.map((item) => item.definitionId));
  const submitAdd = (input: { definitionId?: string; value: PackageValue }) => {
    const definition = definitions.find((candidate) => candidate.id === input.definitionId);
    if (!definition) return Promise.resolve<SubmitErrors>({ definitionId: "REQUIRED" });
    const checked = checkValue(definition.id, definition, input.value);
    if ("errors" in checked) return Promise.resolve(checked.errors);
    state.dispatchPackage({
      type: "ADD",
      item: {
        definitionId: definition.id,
        name: definition.name,
        unit: definition.unit,
        valueType: definition.valueType,
        selectionRequired: definition.selectionRequired,
        pickMode: definition.pickMode,
        allowsPickNotes: definition.allowsPickNotes,
        value: checked.value,
      },
    });
    return Promise.resolve<SubmitErrors>(null);
  };
  const submitEdit = (input: { value: PackageValue }) => {
    if (open?.kind !== "edit") return Promise.resolve<SubmitErrors>(null);
    const item = open.item;
    const checked = checkValue(item.definitionId, item, input.value);
    if ("errors" in checked) return Promise.resolve(checked.errors);
    state.dispatchPackage({
      type: "UPDATE_VALUE",
      definitionId: item.definitionId,
      value: checked.value,
    });
    return Promise.resolve<SubmitErrors>(null);
  };
  const confirmRemove = () => {
    if (open?.kind === "remove") {
      state.dispatchPackage({ type: "REMOVE", definitionId: open.item.definitionId });
    }
    return Promise.resolve();
  };
  const editedItem = open?.kind === "edit" ? open.item : undefined;
  return (
    <>
      <PackageItemsCard
        serviceName={serviceName}
        isMobile={isMobile}
        items={state.items.map((item) => ({
          ...item,
          id: item.definitionId,
          definitionName: item.name,
        }))}
        edit={edit}
      />
      {open?.kind === "add" ? (
        <ProjectItemDialog
          mode="add"
          isOpen
          onOpenChange={close}
          definitions={definitions.filter((definition) => !used.has(definition.id))}
          onSubmit={submitAdd}
        />
      ) : null}
      {editedItem ? (
        <ProjectItemDialog
          mode="edit"
          isOpen
          onOpenChange={close}
          item={editedItem}
          onSubmit={submitEdit}
        />
      ) : null}
      {open?.kind === "remove" ? (
        <ProjectConfirmDialog
          isOpen
          onOpenChange={close}
          title={PROJECT_COPY.removeItemTitle(open.item.name)}
          body={PROJECT_COPY.removeItemBody}
          confirmLabel={PROJECT_COPY.removeItemConfirm}
          onConfirm={confirmRemove}
        />
      ) : null}
    </>
  );
}
/* eslint-enable max-lines-per-function -- one place owns which package dialog is open and what each submit does */
