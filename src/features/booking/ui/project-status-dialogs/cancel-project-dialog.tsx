"use client";
/* eslint-disable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */

import { useState } from "react";

import { cancelReasonRequired } from "@/features/booking/domain/project-status/project-status";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Modal } from "@/ui/patterns/modal/modal";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "../project-field-error/project-field-error";
import type { CancelProjectDialogProps } from "./project-status-dialogs.types";

/** Batalkan proyek?: a reason is optional in BOOKED and required from SHOOTING (AC-PRJ-022). */
export function CancelProjectDialog(props: Readonly<CancelProjectDialogProps>) {
  const { target } = props;
  if (target === null) return null;
  return <CancelBody key={target.id} {...props} target={target} />;
}

function CancelBody(
  props: Readonly<
    CancelProjectDialogProps & { target: NonNullable<CancelProjectDialogProps["target"]> }
  >,
) {
  const isMobile = useMobileViewport();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const isRequired = cancelReasonRequired(props.target.status);
  const confirm = async () => {
    setIsPending(true);
    try {
      const result = await props.cancelAction(props.workspaceId, props.target.id, { reason });
      if (result === undefined) {
        showToast({
          tone: "success",
          title: PROJECT_COPY.toastCancelledTitle,
          body: PROJECT_COPY.toastCancelledBody(props.target.title),
        });
        props.onOpenChange(false);
        props.onDone();
      } else if (result.code === "VALIDATION_FAILED") {
        setError(projectFieldErrorText("reason", result.fieldErrors.reason));
      } else {
        props.onOpenChange(false);
        props.onDone();
      }
    } finally {
      setIsPending(false);
    }
  };
  const handleConfirm = () => {
    void confirm();
  };
  const handleBack = () => {
    props.onOpenChange(false);
  };
  const body = (
    <Textarea
      label={PROJECT_COPY.cancelReasonRequiredLabel}
      optional={!isRequired}
      name="reason"
      value={reason}
      onChange={setReason}
      placeholder={PROJECT_COPY.cancelReasonPlaceholder}
      errorMessage={error}
    />
  );
  const confirmButton = (
    <Button
      variant="danger"
      size={isMobile ? "lg" : "md"}
      className="max-md:w-full"
      isPending={isPending}
      onPress={handleConfirm}
    >
      {PROJECT_COPY.cancelConfirm}
    </Button>
  );
  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onOpenChange={props.onOpenChange}
        title={PROJECT_COPY.cancelDialogTitle}
        description={PROJECT_COPY.cancelDialogDescription}
        variant="form"
        actions={confirmButton}
      >
        {body}
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen
      onOpenChange={props.onOpenChange}
      title={PROJECT_COPY.cancelDialogTitle}
      description={PROJECT_COPY.cancelDialogDescription}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleBack}>
            {PROJECT_COPY.cancelBack}
          </Button>
          {confirmButton}
        </>
      }
    >
      {body}
    </Modal>
  );
}
/* eslint-enable max-lines-per-function -- responsive dialog shell plus the confirm flow share state */
