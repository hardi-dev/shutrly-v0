"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the form share one submit flow */

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { formatIdr, formatIdrNumber } from "@/features/booking/domain/idr-amount/idr-amount";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import type { ProjectInfoDialogProps, ProjectInfoTarget } from "./project-info-dialog.types";

const FORM_ID = "project-info-form";
const noop = () => undefined;

/** Ubah info: title, agreed price (locked once shooting starts) and notes, under the project lock (AC-PRJ-017, 018). */
export function ProjectInfoDialog(props: Readonly<ProjectInfoDialogProps>) {
  const isMobile = useMobileViewport();
  if (props.target === null) return null;
  const description = props.target.canEditDeal
    ? PROJECT_COPY.infoDialogDescription
    : PROJECT_COPY.infoDialogDescriptionLocked;
  const save = (
    <Button type="submit" form={FORM_ID} size={isMobile ? "lg" : "md"} className="max-md:w-full">
      {PROJECT_COPY.infoSave}
    </Button>
  );
  const form = <InfoForm key={props.target.projectId} {...props} target={props.target} />;
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={PROJECT_COPY.infoDialogTitle}
        description={description}
        variant="form"
        actions={save}
      >
        {form}
      </BottomSheet>
    );
  }
  const handleCancel = () => {
    props.onOpenChange(false);
  };
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={PROJECT_COPY.infoDialogTitle}
      description={description}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {PROJECT_COPY.infoCancel}
          </Button>
          {save}
        </>
      }
    >
      {form}
    </Modal>
  );
}

function InfoForm(props: Readonly<ProjectInfoDialogProps & { target: ProjectInfoTarget }>) {
  const { target } = props;
  const [title, setTitle] = useState(target.title);
  const [price, setPrice] = useState(formatIdrNumber(target.agreedPrice));
  const [notes, setNotes] = useState(target.notes ?? "");
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await props.updateAction(props.workspaceId, target.projectId, {
      title,
      agreedPrice: price,
      notes,
    });
    if (result === undefined) {
      showToast({ tone: "success", title: PROJECT_COPY.infoSavedTitle });
      props.onOpenChange(false);
      props.onSaved();
    } else if (result.code === "VALIDATION_FAILED") {
      setErrors(
        Object.fromEntries(
          Object.entries(result.fieldErrors).map(([path, key]) => [
            path,
            projectFieldErrorText(path, key),
          ]),
        ),
      );
    } else {
      showToast({
        tone: "danger",
        title:
          result.code === "DEAL_LOCKED"
            ? PROJECT_COPY.infoDealLockedTitle
            : PROJECT_COPY.infoCancelledTitle,
      });
      props.onSaved();
    }
  };
  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void handleSubmit(event);
  };
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      <TextField
        label={PROJECT_COPY.titleLabel}
        name="title"
        value={title}
        onChange={setTitle}
        onBlur={noop}
        errorMessage={errors.title}
      />
      <TextField
        label={PROJECT_COPY.priceLabel}
        name="agreedPrice"
        prefix={PROJECT_COPY.pricePrefix}
        value={price}
        onChange={setPrice}
        onBlur={noop}
        isDisabled={!target.canEditDeal}
        description={
          target.canEditDeal
            ? PROJECT_COPY.priceHelper(formatIdr(target.basePrice))
            : PROJECT_COPY.infoPriceLocked
        }
        errorMessage={errors.agreedPrice}
      />
      <Textarea
        label={PROJECT_COPY.notesLabel}
        optional
        name="notes"
        value={notes}
        onChange={setNotes}
        placeholder={PROJECT_COPY.notesPlaceholder}
        errorMessage={errors.notes}
      />
    </form>
  );
}
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the form share one submit flow */
