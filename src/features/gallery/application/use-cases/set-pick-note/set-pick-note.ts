import "server-only";

import { normalisePickNote } from "@/features/gallery/domain/pick-note/pick-note";

import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { setPickNoteSchema } from "../../schemas/set-pick/set-pick.schema";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { countSelectionWrite } from "../selection-write-limit/selection-write-limit";
import type { SelectionWriteDeps, SetPickNoteResult } from "../set-pick/set-pick.types";

async function applyNote(
  group: SelectionGroupRecord,
  writer: PickWriter,
  photoId: string,
  note: string | null,
): Promise<SetPickNoteResult> {
  if (group.status !== "OPEN") return { ok: false, code: "GROUP_NOT_OPEN" };
  if (!group.allowsPickNotes) return { ok: false, code: "NOTES_OFF" };
  if (!(await writer.findPick(photoId))) return { ok: false, code: "NOT_PICKED" };
  await writer.setNote(photoId, note);
  return { ok: true, note };
}

/**
 * Writes, changes or clears the client's note on one pick under the group lock: the group must
 * be `OPEN`, its item must allow notes, and the note is at most 500 characters (D-12, A-32,
 * AC-SEL-021).
 * @param deps - selection repository and counters
 * @param client - the signed-in client context
 * @param input - untrusted `{ groupId, photoId, note }`
 * @returns the stored note, or why it was refused
 */
export async function setPickNote(
  deps: SelectionWriteDeps,
  client: ClientContext,
  input: unknown,
): Promise<SetPickNoteResult> {
  const parsed = setPickNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };
  const normalised = normalisePickNote(parsed.data.note);
  if (!normalised.ok) return { ok: false, code: "TOO_LONG" };
  if (!(await countSelectionWrite(deps.rateLimiter, client.sessionId))) {
    return { ok: false, code: "RATE_LIMITED" };
  }
  const { groupId, photoId } = parsed.data;
  const context = { workspaceId: client.workspaceId };
  const result = await deps.selections.withLockedGroup<SetPickNoteResult>(
    context,
    client.projectId,
    groupId,
    (group, writer) => applyNote(group, writer, photoId, normalised.note),
  );
  return result === "NOT_FOUND" ? { ok: false, code: "NOT_FOUND" } : result;
}
