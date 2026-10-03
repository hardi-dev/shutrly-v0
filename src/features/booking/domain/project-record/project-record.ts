import type { NextTitleInput, NextTitleResult } from "./project-record.types";

export const PROJECT_TITLE_MAX_LENGTH = 100;
export const PROJECT_NOTES_MAX_LENGTH = 2000;
export const CANCEL_REASON_MAX_LENGTH = 500;

const codePointCount = (value: string) => Array.from(value).length;

/** Tells whether a title fits the length limit, counting code points (BR-PRJ-008). @param title - trimmed title @returns true when it fits */
export function fitsProjectTitleLength(title: string): boolean {
  return codePointCount(title) <= PROJECT_TITLE_MAX_LENGTH;
}
/** Tells whether notes fit the length limit, counting code points (BR-PRJ-008). @param notes - trimmed notes @returns true when they fit */
export function fitsProjectNotesLength(notes: string): boolean {
  return codePointCount(notes) <= PROJECT_NOTES_MAX_LENGTH;
}
/** Tells whether a cancel reason fits the length limit, counting code points. @param reason - trimmed reason @returns true when it fits */
export function fitsCancelReasonLength(reason: string): boolean {
  return codePointCount(reason) <= CANCEL_REASON_MAX_LENGTH;
}

/** Builds the default project title from the service and client names (A-2). @param serviceName - service name @param clientName - client name @returns "service — client" cut to the title limit */
export function defaultProjectTitle(serviceName: string, clientName: string): string {
  return Array.from(`${serviceName} — ${clientName}`).slice(0, PROJECT_TITLE_MAX_LENGTH).join("");
}

/** Trims text and turns blank (or null) into null. @param value - untrusted text @returns the trimmed text or null */
export function trimToNull(value: string | null): string | null {
  const text = value?.trim() ?? "";
  return text === "" ? null : text;
}

export const PROJECT_SEARCH_MAX_LENGTH = 100;

/** Decides the title after the client or service changes: it follows the default until the Owner edits it (A-2). @param input - the current title, the last default shown, and the new names @returns the next title and default */
export function nextProjectTitle(input: NextTitleInput): NextTitleResult {
  const nextDefault =
    input.serviceName !== null && input.clientName !== null
      ? defaultProjectTitle(input.serviceName, input.clientName)
      : null;
  const isUntouched = input.currentTitle === "" || input.currentTitle === input.lastDefault;
  return {
    title: isUntouched && nextDefault !== null ? nextDefault : input.currentTitle,
    lastDefault: nextDefault,
  };
}
