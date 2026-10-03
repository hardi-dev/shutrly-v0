import { canCancel, canDeleteDraft, nextStep } from "../project-status/project-status";
import type { ProjectMenuGroups, ProjectMenuInput, ProjectMenuItem } from "./project-menu.types";

/** Builds the project menu for a status: project actions, Kirim ke klien, destructive (D-13, AC-PRJ-027). @param input - stored status and whether the client has a number @returns the three groups, empty ones omitted by the UI */
export function buildProjectMenu(input: ProjectMenuInput): ProjectMenuGroups {
  const step = nextStep(input.status);
  const isClosed = input.status === "COMPLETED" || input.status === "CANCELLED";
  const project: ProjectMenuItem[] = [];
  if (step !== null) project.push({ kind: "STEP", step });
  if (!isClosed) project.push({ kind: "EDIT_INFO" });
  const sendToClient: ProjectMenuItem[] = [
    input.hasWhatsappNumber ? { kind: "CHAT_WHATSAPP" } : { kind: "ADD_WHATSAPP_NUMBER" },
  ];
  let destructive: ProjectMenuItem[] = [];
  if (canDeleteDraft(input.status)) destructive = [{ kind: "DELETE_DRAFT" }];
  else if (canCancel(input.status)) destructive = [{ kind: "CANCEL" }];
  return { project, sendToClient, destructive };
}
