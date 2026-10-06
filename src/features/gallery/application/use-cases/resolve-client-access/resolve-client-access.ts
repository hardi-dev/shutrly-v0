import "server-only";

import { UNKNOWN_TOKEN_PER_ADDRESS } from "@/features/gallery/domain/client-access-limits/client-access-limits";
import { isAvailableToClient } from "@/features/gallery/domain/client-gallery-availability/client-gallery-availability";
import { isSessionValid } from "@/features/gallery/domain/client-session/client-session";
import { isWellFormedToken } from "@/features/gallery/domain/client-token/client-token";

import type { ClientAccessRecord } from "../../ports/client-access-repository/client-access-repository.port";
import { tokenHashOf, unknownTokenKey } from "../client-access-keys/client-access-keys";
import type {
  ClientGateDeps,
  ClientGateRequest,
  ClientGateResult,
  ClientGateView,
} from "./resolve-client-access.types";

const NEUTRAL: ClientGateResult = { kind: "NEUTRAL" };

/** The open gallery behind a token, or null for the neutral page (D-4 steps 1–3, AC-ACC-004/005). @param deps - repository, limiter and clock @param token - the untrusted token @param ip - the client address @returns the record of an available gallery */
export async function findAvailableGallery(
  deps: Pick<ClientGateDeps, "repository" | "rateLimiter" | "now">,
  token: string,
  ip: string,
): Promise<ClientAccessRecord | null> {
  if (!isWellFormedToken(token)) return null;
  const unknownKey = await unknownTokenKey(ip);
  if (!(await deps.rateLimiter.peek(unknownKey, UNKNOWN_TOKEN_PER_ADDRESS))) return null;
  const record = await deps.repository.findByTokenUnscoped(token);
  if (!record) {
    await deps.rateLimiter.hit(unknownKey, UNKNOWN_TOKEN_PER_ADDRESS);
    return null;
  }
  const available = isAvailableToClient({ ...record, now: deps.now });
  return available ? record : null;
}

/** The studio, project and client names the gate and header show. @param record - the resolved record @returns the view */
export function gateViewOf(record: ClientAccessRecord): ClientGateView {
  return {
    studioName: record.studioName,
    projectTitle: record.projectTitle,
    clientFirstName: record.clientFirstName,
  };
}

/**
 * Runs the client gate on every client page, action and route (D-4): neutral page, password
 * screen, or a signed-in context. An Owner session plays no part (BR-ACC-003).
 * @param deps - repository, limiter, cookie signer and clock
 * @param request - the untrusted token, the address and the cookie value
 * @returns what the client may see
 */
export async function resolveClientAccess(
  deps: ClientGateDeps,
  request: ClientGateRequest,
): Promise<ClientGateResult> {
  const record = await findAvailableGallery(deps, request.token, request.ip);
  if (!record?.galleryId || record.passwordVersion === null) return NEUTRAL;
  const gate = gateViewOf(record);
  const payload = request.cookie ? await deps.signer.verify(request.cookie) : null;
  const valid =
    payload !== null &&
    isSessionValid({
      payload,
      projectId: record.projectId,
      galleryId: record.galleryId,
      passwordVersion: record.passwordVersion,
      tokenHash: await tokenHashOf(request.token),
      nowSeconds: Math.floor(deps.now.getTime() / 1000),
    });
  if (!payload || !valid) return { kind: "PASSWORD", gate };
  return {
    kind: "SIGNED_IN",
    gate,
    context: {
      workspaceId: record.workspaceId,
      projectId: record.projectId,
      galleryId: record.galleryId,
      sessionId: payload.sid,
      token: request.token,
      contentVersion: record.contentVersion ?? 1,
    },
  };
}
