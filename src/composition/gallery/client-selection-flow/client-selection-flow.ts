import "server-only";

import { browsePickPhotos } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos";
import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import { getPickView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view";
import type { PickViewResult } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import { getReview } from "@/features/gallery/application/use-cases/get-review/get-review";
import type { ReviewResult } from "@/features/gallery/application/use-cases/get-review/get-review.types";
import { listPickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets";
import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import { setPickNote } from "@/features/gallery/application/use-cases/set-pick-note/set-pick-note";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";
import type { SubmitSelectionGroupResult } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group.types";
import { logger } from "@/shared/logging/logger";

import type { SignedOut } from "../client-gallery-flow/client-gallery-flow";
import { withSignedInClient } from "../client-gallery-scope/client-gallery-scope";
import type { ClientScopeResult } from "../client-gallery-scope/client-gallery-scope.types";
import type { PickLoad } from "./client-selection-flow.types";

const SIGNED_OUT: SignedOut = { kind: "SIGNED_OUT" };

/** Loads a Pilih page: the group view and the first page of the flat grid; a failed first page becomes null so the page shows its retry state (D-12, A-25). @param rawToken - the untrusted route token @param rawGroupId - the untrusted route group id @returns the gate outcome with the load */
export function loadPickEntry(
  rawToken: string,
  rawGroupId: string,
): Promise<ClientScopeResult<PickLoad>> {
  return withSignedInClient(rawToken, async (client, scope) => {
    const result = await getPickView(scope, client, rawGroupId);
    if (result.kind !== "VIEW") return result;
    try {
      return { ...result, firstPage: await browsePickPhotos(scope, client, null) };
    } catch {
      logger.error("client.pick_photos_failed", { workspaceId: client.workspaceId });
      return { ...result, firstPage: null };
    }
  });
}

/** Re-reads a Pilih group after a refused change, so the screen shows the stored picks (D-12). @param rawToken - the untrusted route token @param rawGroupId - untrusted group id @returns the view result, or SIGNED_OUT */
export async function reloadPickEntry(
  rawToken: string,
  rawGroupId: unknown,
): Promise<PickViewResult | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    getPickView(scope, client, rawGroupId),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Re-reads the viewer's *Pilih untuk…* groups and picks after a refused change (A-30). @param rawToken - the untrusted route token @returns the targets, or SIGNED_OUT */
export async function reloadPickTargetsEntry(rawToken: string): Promise<PickTargets | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    listPickTargets(scope, client),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Reads the next page of Pilih's flat grid. @param rawToken - the untrusted route token @param rawCursor - untrusted cursor @returns the page, or SIGNED_OUT */
export async function browsePickPhotosEntry(
  rawToken: string,
  rawCursor: unknown,
): Promise<PickPhotosPage | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    browsePickPhotos(scope, client, rawCursor),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Picks, re-quantifies or un-picks one photo for the signed-in client (D-12, AC-SEL-002…007). @param rawToken - the untrusted route token @param input - untrusted `{ groupId, photoId, quantity }` @returns the result, or SIGNED_OUT */
export async function setPickEntry(
  rawToken: string,
  input: unknown,
): Promise<SetPickResult | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    setPick(scope, client, input),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Writes or clears the signed-in client's note on one pick (D-12, A-32, AC-SEL-021). @param rawToken - the untrusted route token @param input - untrusted `{ groupId, photoId, note }` @returns the result, or SIGNED_OUT */
export async function setPickNoteEntry(
  rawToken: string,
  input: unknown,
): Promise<SetPickNoteResult | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    setPickNote(scope, client, input),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Loads Tinjau, or the read-only *Lihat pilihan* when the group is no longer open (A-29, D-2). @param rawToken - the untrusted route token @param rawGroupId - the untrusted route group id @returns the gate outcome with the review */
export function loadReviewEntry(
  rawToken: string,
  rawGroupId: string,
): Promise<ClientScopeResult<ReviewResult>> {
  return withSignedInClient(rawToken, (client, scope) => getReview(scope, client, rawGroupId));
}

/** Re-reads Tinjau after a refused change, so the screen shows the stored picks (D-12). @param rawToken - the untrusted route token @param rawGroupId - untrusted group id @returns the review, or SIGNED_OUT */
export async function reloadReviewEntry(
  rawToken: string,
  rawGroupId: unknown,
): Promise<ReviewResult | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    getReview(scope, client, rawGroupId),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}

/** Sends one group to the photographer for the signed-in client (D-13, A-5, AC-SEL-008/009). @param rawToken - the untrusted route token @param input - untrusted `{ groupId, confirmBelowLimit }` @returns the result, or SIGNED_OUT */
export async function submitSelectionGroupEntry(
  rawToken: string,
  input: unknown,
): Promise<SubmitSelectionGroupResult | SignedOut> {
  const result = await withSignedInClient(rawToken, (client, scope) =>
    submitSelectionGroup(scope, client, input, scope.now),
  );
  return result.kind === "SIGNED_IN" ? result.value : SIGNED_OUT;
}
