import "server-only";

import {
  canSubmit,
  effectiveLimit,
  remainingPlaces,
} from "@/features/gallery/domain/selection-usage/selection-usage";

import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { submitSelectionGroupSchema } from "../../schemas/submit-selection-group/submit-selection-group.schema";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { countSelectionWrite } from "../selection-write-limit/selection-write-limit";
import type { SelectionWriteDeps } from "../set-pick/set-pick.types";
import type { SubmitSelectionGroupResult } from "./submit-selection-group.types";

async function submitLocked(
  group: SelectionGroupRecord,
  writer: PickWriter,
  confirmBelowLimit: boolean,
  now: Date,
): Promise<SubmitSelectionGroupResult> {
  const check = canSubmit(group);
  if (check === "NOT_OPEN") return { ok: false, code: "GROUP_NOT_OPEN" };
  if (check === "NO_PICKS") return { ok: false, code: "NO_PICKS" };
  const remaining = remainingPlaces(effectiveLimit(group.baseLimit, group.extraLimit), group.usage);
  if (remaining > 0 && !confirmBelowLimit) {
    return { ok: false, code: "NEEDS_CONFIRMATION", remaining };
  }
  // Below the limit the send is recorded and the group stays open (Owner 2026-10-07, BR-SEL-005).
  await writer.markSubmitted(now, remaining === 0);
  return { ok: true, groupName: group.name, usage: group.usage, remaining };
}

/**
 * Submits one group under its lock: at least one pick, `OPEN`, and a below-limit submission only
 * after the client confirmed the places left; records `submitted_at`, and only a submission at the
 * limit makes the group `SUBMITTED` (D-13, BR-SEL-005/006, A-5).
 * @param deps - selection repository and counters
 * @param client - the signed-in client context
 * @param input - untrusted `{ groupId, confirmBelowLimit }`
 * @param now - the submission time
 * @returns the submitted group, NEEDS_CONFIRMATION with the places left, or why it was refused
 */
export async function submitSelectionGroup(
  deps: SelectionWriteDeps,
  client: ClientContext,
  input: unknown,
  now: Date,
): Promise<SubmitSelectionGroupResult> {
  const parsed = submitSelectionGroupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };
  if (!(await countSelectionWrite(deps.rateLimiter, client.sessionId))) {
    return { ok: false, code: "RATE_LIMITED" };
  }
  const { groupId, confirmBelowLimit } = parsed.data;
  const result = await deps.selections.withLockedGroup(
    { workspaceId: client.workspaceId },
    client.projectId,
    groupId,
    (group, writer) => submitLocked(group, writer, confirmBelowLimit, now),
  );
  return result === "NOT_FOUND" ? { ok: false, code: "NOT_FOUND" } : result;
}
