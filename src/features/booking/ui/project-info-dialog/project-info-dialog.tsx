"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the form share one submit flow */

import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";
import { useState } from "react";

import { formatIdr, formatIdrNumber } from "@/features/booking/domain/idr-amount/idr-amount";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { useLocaleReformat } from "../locale-reformat/use-locale-reformat";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import { PROJECT_INFO_DIALOG_COPY_NAMESPACE } from "./project-info-dialog.copy";
import type { ProjectInfoDialogProps, ProjectInfoTarget } from "./project-info-dialog.types";

const FORM_ID = "project-info-form";
const noop = () => undefined;

/** Ubah info: title, agreed price (locked once shooting starts) and notes, under the project lock (AC-PRJ-017, 018). */
export function ProjectInfoDialog(props: Readonly<ProjectInfoDialogProps>) {
  const t = useTranslations(PROJECT_INFO_DIALOG_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  if (props.target === null) return null;
  const description = props.target.canEditDeal
    ? t("infoDialogDescription")
    : t("infoDialogDescriptionLocked");
  const save = (
    <Button type="submit" form={FORM_ID} size={isMobile ? "lg" : "md"} className="max-md:w-full">
      {t("infoSave")}
    </Button>
  );
  const form = <InfoForm key={props.target.projectId} {...props} target={props.target} />;
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={t("infoDialogTitle")}
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
      title={t("infoDialogTitle")}
      description={description}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {t("infoCancel")}
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
  const t = useTranslations(PROJECT_INFO_DIALOG_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const { target } = props;
  const [title, setTitle] = useState(target.title);
  const [price, setPrice] = useState(formatIdrNumber(target.agreedPrice, locale));
  useLocaleReformat({ value: price, setValue: setPrice, kind: "amount" });
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
      showToast({ tone: "success", title: t("infoSavedTitle") });
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
        title: result.code === "DEAL_LOCKED" ? t("infoDealLockedTitle") : t("infoCancelledTitle"),
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
        label={t("titleLabel")}
        name="title"
        value={title}
        onChange={setTitle}
        onBlur={noop}
        errorMessage={errors.title}
      />
      <TextField
        label={t("priceLabel")}
        name="agreedPrice"
        prefix={t("pricePrefix")}
        value={price}
        onChange={setPrice}
        onBlur={noop}
        isDisabled={!target.canEditDeal}
        description={
          target.canEditDeal
            ? t("priceHelper", { amount: formatIdr(target.basePrice, locale) })
            : t("infoPriceLocked")
        }
        errorMessage={errors.agreedPrice}
      />
      <Textarea
        label={t("notesLabel")}
        optional
        name="notes"
        value={notes}
        onChange={setNotes}
        placeholder={t("notesPlaceholder")}
        errorMessage={errors.notes}
      />
    </form>
  );
}
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the form share one submit flow */
