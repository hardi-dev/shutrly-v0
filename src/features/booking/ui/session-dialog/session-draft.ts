import { sessionInputSchema } from "@/features/booking/domain/session/session.schema";

import { projectFieldErrorText } from "../project-field-error/project-field-error";
import type { SessionDraft, SessionDraftErrors, SessionWithTeam } from "./session-dialog.types";

export const EMPTY_SESSION_DRAFT: SessionDraft = {
  name: "",
  date: "",
  startTime: null,
  endTime: null,
  location: "",
  team: [],
};

/** Turns a stored session into the editable draft the dialog fills its fields with. @param session - the stored session or null @returns the draft */
export function toSessionDraft(session: SessionWithTeam | null): SessionDraft {
  if (session === null) return EMPTY_SESSION_DRAFT;
  return { ...session, location: session.location ?? "", team: session.team ?? [] };
}

const DRAFT_KEYS: readonly (keyof SessionDraftErrors)[] = [
  "name",
  "date",
  "startTime",
  "endTime",
  "location",
];

/** Validates a draft with the shared session schema (client side is UX only, C-004). @param draft - what the Owner typed @returns the parsed session or the first error per field */
export function validateSessionDraft(
  draft: SessionDraft,
): { readonly session: SessionWithTeam } | { readonly errors: SessionDraftErrors } {
  const parsed = sessionInputSchema.safeParse(draft);
  if (parsed.success) return { session: { ...parsed.data, team: draft.team } };
  const errors: Partial<Record<keyof SessionDraftErrors, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = DRAFT_KEYS.find((candidate) => candidate === issue.path[0]);
    if (key && errors[key] === undefined) {
      errors[key] = projectFieldErrorText(key, issue.message);
    }
  }
  return { errors };
}
