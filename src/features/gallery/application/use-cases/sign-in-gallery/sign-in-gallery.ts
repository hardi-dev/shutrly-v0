import "server-only";

import {
  CLIENT_SESSION_DAYS,
  minutesUntilWindowEnds,
  PASSWORD_PER_TOKEN,
  PASSWORD_PER_TOKEN_AND_ADDRESS,
} from "@/features/gallery/domain/client-access-limits/client-access-limits";

import { clientSignInSchema } from "../../schemas/client-sign-in/client-sign-in.schema";
import { passwordKeys, tokenHashOf } from "../client-access-keys/client-access-keys";
import { findAvailableGallery } from "../resolve-client-access/resolve-client-access";
import type {
  SignInGalleryDeps,
  SignInGalleryRequest,
  SignInGalleryResult,
} from "./sign-in-gallery.types";

const SECONDS_PER_DAY = 86_400;
const SESSION_SECONDS = CLIENT_SESSION_DAYS * SECONDS_PER_DAY;

/** Counts one password attempt on both limits before any hash compare (D-5, AC-ACC-003). @param deps - the limiter and clock @param tokenHash - the token fingerprint @param ip - the address @returns minutes to wait, or null when allowed */
async function countAttempt(
  deps: SignInGalleryDeps,
  tokenHash: string,
  ip: string,
): Promise<number | null> {
  const [perAddress, perToken] = await passwordKeys(tokenHash, ip);
  const [addressOk, tokenOk] = await Promise.all([
    deps.rateLimiter.hit(perAddress, PASSWORD_PER_TOKEN_AND_ADDRESS),
    deps.rateLimiter.hit(perToken, PASSWORD_PER_TOKEN),
  ]);
  if (addressOk && tokenOk) return null;
  const rule = tokenOk ? PASSWORD_PER_TOKEN_AND_ADDRESS : PASSWORD_PER_TOKEN;
  return minutesUntilWindowEnds(rule, deps.now);
}

/**
 * Checks the gallery password and issues the 30-day client session (D-5, AC-ACC-001…003).
 * Every attempt counts, the correct one too; over a limit the hash is not checked.
 * @param deps - repository, limiter, hasher, signer, id source and clock
 * @param request - the untrusted token, address and form values
 * @returns the outcome; on success the signed cookie value
 */
export async function signInGallery(
  deps: SignInGalleryDeps,
  request: SignInGalleryRequest,
): Promise<SignInGalleryResult> {
  const parsed = clientSignInSchema.safeParse(request.values);
  if (!parsed.success) return { kind: "INVALID" };
  const record = await findAvailableGallery(deps, request.token, request.ip);
  if (!record?.galleryId || !record.passwordHash || record.passwordVersion === null) {
    return { kind: "NEUTRAL" };
  }
  const tokenHash = await tokenHashOf(request.token);
  const wait = await countAttempt(deps, tokenHash, request.ip);
  if (wait !== null) return { kind: "TOO_MANY_ATTEMPTS", minutes: wait };
  if (!(await deps.hasher.verify(record.passwordHash, parsed.data.password))) {
    return { kind: "WRONG_PASSWORD" };
  }
  const cookie = await deps.signer.sign({
    v: 1,
    sid: deps.newSessionId(),
    projectId: record.projectId,
    galleryId: record.galleryId,
    pv: record.passwordVersion,
    th: tokenHash,
    exp: Math.floor(deps.now.getTime() / 1000) + SESSION_SECONDS,
  });
  return { kind: "SIGNED_IN", cookie, maxAgeSeconds: SESSION_SECONDS };
}
