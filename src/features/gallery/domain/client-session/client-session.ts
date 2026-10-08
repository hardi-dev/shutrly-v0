import type { SessionCheckInput } from "./client-session.types";

/**
 * Whether a verified cookie payload still signs this client in (ADR-023, A-1, BR-GAL-003). The
 * signer only returns version-1 payloads.
 * @param input - the payload, the gallery the token resolves to, the token hash and the clock
 * @returns true only if nothing about the gallery or link changed and the cookie is not expired
 */
export function isSessionValid(input: SessionCheckInput): boolean {
  const { payload, projectId, galleryId, passwordVersion, tokenHash, nowSeconds } = input;
  return (
    payload.exp > nowSeconds &&
    payload.th === tokenHash &&
    payload.projectId === projectId &&
    payload.galleryId === galleryId &&
    payload.pv === passwordVersion
  );
}
