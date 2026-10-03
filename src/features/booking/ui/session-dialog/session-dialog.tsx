"use client";

import type { SyntheticEvent } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { DateField } from "@/ui/patterns/date-field/date-field";
import { Modal } from "@/ui/patterns/modal/modal";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { TimeField } from "@/ui/primitives/time-field/time-field";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { SessionTeamField } from "../session-team-field/session-team-field";
import type { SessionDialogProps } from "./session-dialog.types";
import { useSessionDraft } from "./use-session-draft";

const FORM_ID = "session-form";
const noop = () => undefined;

/** Adds or edits one session in a modal (desktop) or a form sheet (phone), validated by the shared session schema. */
export function SessionDialog(props: Readonly<SessionDialogProps>) {
  const isMobile = useMobileViewport();
  const isEditing = props.session !== null;
  const title = isEditing ? PROJECT_COPY.sessionEditTitle : PROJECT_COPY.sessionDialogTitle;
  const save = (
    <Button type="submit" form={FORM_ID} size={isMobile ? "lg" : "md"}>
      {isEditing ? PROJECT_COPY.sessionSaveEdit : PROJECT_COPY.sessionSave}
    </Button>
  );
  const handleCancel = () => {
    props.onOpenChange(false);
  };
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        title={title}
        description={props.description ?? PROJECT_COPY.sessionDialogDescription}
        variant="form"
        actions={save}
      >
        <SessionForm {...props} />
      </BottomSheet>
    );
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      title={title}
      description={props.description ?? PROJECT_COPY.sessionDialogDescription}
      size="md"
      actions={
        <>
          <Button variant="secondary" onPress={handleCancel}>
            {PROJECT_COPY.sessionCancel}
          </Button>
          {save}
        </>
      }
    >
      <SessionForm {...props} />
    </Modal>
  );
}

function SessionForm({
  isOpen,
  session,
  onSave,
  onOpenChange,
  members,
}: Readonly<SessionDialogProps>) {
  const fields = useSessionDraft(isOpen, session, onSave);
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    if (fields.submit(event)) onOpenChange(false);
  };
  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-(--space-4)">
      <SessionFields {...fields} />
      {members ? (
        <SessionTeamField
          members={members}
          picks={fields.draft.team}
          onChange={fields.update("team")}
        />
      ) : null}
    </form>
  );
}

function SessionFields({
  draft,
  errors,
  update,
}: Readonly<Pick<ReturnType<typeof useSessionDraft>, "draft" | "errors" | "update">>) {
  const handleDate = (date: string | null) => {
    update("date")(date ?? "");
  };
  return (
    <>
      <TextField
        label={PROJECT_COPY.sessionName}
        name="name"
        value={draft.name}
        onChange={update("name")}
        onBlur={noop}
        placeholder={PROJECT_COPY.sessionNamePlaceholder}
        errorMessage={errors.name}
      />
      <DateField
        label={PROJECT_COPY.sessionDate}
        value={draft.date === "" ? null : draft.date}
        onChange={handleDate}
        display="weekday"
        placeholder={PROJECT_COPY.sessionDatePlaceholder}
        errorMessage={errors.date}
      />
      <SessionTimes
        startTime={draft.startTime}
        endTime={draft.endTime}
        endError={errors.endTime}
        onStart={update("startTime")}
        onEnd={update("endTime")}
      />
      <TextField
        label={PROJECT_COPY.sessionLocation}
        isOptional
        name="location"
        value={draft.location}
        onChange={update("location")}
        onBlur={noop}
        placeholder={PROJECT_COPY.sessionLocationPlaceholder}
        errorMessage={errors.location}
      />
    </>
  );
}

function SessionTimes({
  startTime,
  endTime,
  endError,
  onStart,
  onEnd,
}: Readonly<{
  startTime: string | null;
  endTime: string | null;
  endError?: string;
  onStart: (value: string | null) => void;
  onEnd: (value: string | null) => void;
}>) {
  return (
    <div className="grid grid-cols-2 items-start gap-(--space-3)">
      <TimeField
        label={PROJECT_COPY.sessionStart}
        value={startTime}
        onChange={onStart}
        isOptional
      />
      <TimeField
        label={PROJECT_COPY.sessionEnd}
        value={endTime}
        onChange={onEnd}
        isOptional
        errorMessage={endError}
      />
    </div>
  );
}
