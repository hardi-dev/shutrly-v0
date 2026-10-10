"use client";

import { useState } from "react";

import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AddOnConfirmDialog } from "../add-on-confirm-dialog/add-on-confirm-dialog";
import { ADD_ON_COPY as COPY } from "../add-on-copy/add-on.copy";
import { AddOnDialog } from "../add-on-dialog/add-on-dialog";
import { AddOnMenu } from "../add-on-menu/add-on-menu";
import { addOnMeta, addOnStatusChip } from "../add-on-text/add-on-text";
import { useAddOnActions } from "../use-add-on-actions/use-add-on-actions";
import type { AddOnCardBodyProps, AddOnCardProps, AddOnRowProps } from "./add-on-card.types";

/** The project page's *Add-on* card: empty, the list with status chips, and the locked-group note, with *Tambah add-on* and each row's actions (addon-kartu states A–C, spec §4, AC-ADD-001). @param props - workspace, project, the card view and the server actions @returns the card */
export function AddOnCard(props: Readonly<AddOnCardProps>) {
  const isMobile = useMobileViewport();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const flows = useAddOnActions(props);
  const { card } = props;
  const handleAdd = () => {
    setIsFormOpen(true);
  };
  const addButton = card.canCreate ? (
    <Button
      variant="secondary"
      iconLeading="plus"
      size={isMobile ? "lg" : "md"}
      className="max-md:w-full"
      onPress={handleAdd}
    >
      {COPY.add}
    </Button>
  ) : null;
  return (
    <>
      <SectionCard
        title={COPY.cardTitle}
        description={COPY.cardDescription}
        actions={isMobile ? undefined : addButton}
        content="flush"
      >
        <CardBody card={card} flows={flows} />
        {isMobile && addButton ? (
          <div className="px-(--space-4) pb-(--space-4)">{addButton}</div>
        ) : null}
      </SectionCard>
      <AddOnDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        workspaceId={props.workspaceId}
        projectId={props.projectId}
        targets={card.targets}
        createAction={props.actions.createAction}
      />
      <AddOnConfirmDialog
        state={flows.confirm}
        isPending={flows.isPending}
        onConfirm={flows.confirmCurrent}
        onClose={flows.close}
      />
    </>
  );
}

function CardBody({ card, flows }: Readonly<AddOnCardBodyProps>) {
  const note =
    card.lockedGroupNames.length > 0 ? COPY.lockedNote(card.lockedGroupNames.join(", ")) : null;
  if (card.addOns.length === 0) {
    return <p className={NOTE_CLASS}>{note ?? COPY.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-(--space-3) p-(--space-4) md:p-(--space-6)">
      <ul className="flex flex-col gap-(--space-3)">
        {card.addOns.map((row) => (
          <AddOnRow key={row.id} row={row} flows={flows} />
        ))}
      </ul>
      {note ? (
        <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {note}
        </p>
      ) : null}
    </div>
  );
}

const NOTE_CLASS =
  "p-(--space-4) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary) md:p-(--space-6)";

function AddOnRow({ row, flows }: Readonly<AddOnRowProps>) {
  const locale = useFormattingLocale();
  const handleApprove = () => {
    flows.open({ kind: "APPROVE", row });
  };
  const handleCancel = () => {
    flows.open({ kind: "CANCEL", row });
  };
  const handleDelete = () => {
    flows.deleteDraft(row);
  };
  return (
    <li className="flex items-center justify-between gap-(--space-3)">
      <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
        <span className="text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
          {row.description}
        </span>
        <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {addOnMeta(row, locale)}
        </span>
      </span>
      <StatusChip {...addOnStatusChip(row.status)} hasDot />
      <AddOnMenu
        row={row}
        onApprove={handleApprove}
        onDeleteDraft={handleDelete}
        onCancel={handleCancel}
      />
    </li>
  );
}
