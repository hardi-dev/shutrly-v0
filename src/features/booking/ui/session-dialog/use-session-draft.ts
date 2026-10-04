"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

import type { SessionDraft, SessionDraftErrors, SessionWithTeam } from "./session-dialog.types";
import { toSessionDraft, validateSessionDraft } from "./session-draft";

/** Keeps the session dialog's draft and errors, resetting them whenever the dialog opens. @param isOpen - whether the dialog is open @param session - the session being edited or null @param onSave - called with the validated session @returns the draft, errors and field handlers */
export function useSessionDraft(
  isOpen: boolean,
  session: SessionWithTeam | null,
  onSave: (session: SessionWithTeam) => void,
) {
  const [draft, setDraft] = useState<SessionDraft>(() => toSessionDraft(session));
  const [errors, setErrors] = useState<SessionDraftErrors>({});
  useEffect(() => {
    if (!isOpen) return;
    const reset = window.setTimeout(() => {
      setDraft(toSessionDraft(session));
      setErrors({});
    });
    return () => {
      window.clearTimeout(reset);
    };
  }, [isOpen, session]);
  const update = <K extends keyof SessionDraft>(key: K) => {
    return (value: SessionDraft[K]) => {
      setDraft((previous) => ({ ...previous, [key]: value }));
    };
  };
  // `pending` is a member and role chosen in the team field but not added yet: saving keeps it.
  const submit = (event: SyntheticEvent<HTMLFormElement>, pending: TeamPick | null): boolean => {
    event.preventDefault();
    const result = validateSessionDraft(draft);
    if ("errors" in result) {
      setErrors(result.errors);
      return false;
    }
    onSave(
      pending === null
        ? result.session
        : { ...result.session, team: [...(result.session.team ?? []), pending] },
    );
    return true;
  };
  return { draft, errors, update, submit };
}
