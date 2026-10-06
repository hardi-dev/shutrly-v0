import type { ClientAccessRepositoryPort } from "../../ports/client-access-repository/client-access-repository.port";
import type { ClientSessionSignerPort } from "../../ports/client-session-signer/client-session-signer.port";
import type { GalleryRateLimiterPort } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";

/** The resolved, signed-in context every client use case receives (D-4). */
export interface ClientContext {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly galleryId: string;
  readonly sessionId: string;
  /** Used only to build same-origin URLs; never logged. */
  readonly token: string;
  readonly contentVersion: number;
}

/** What the password screen and the client header show. */
export interface ClientGateView {
  readonly studioName: string;
  readonly projectTitle: string;
  readonly clientFirstName: string;
}

export type ClientGateResult =
  | { readonly kind: "NEUTRAL" }
  | { readonly kind: "PASSWORD"; readonly gate: ClientGateView }
  | { readonly kind: "SIGNED_IN"; readonly gate: ClientGateView; readonly context: ClientContext };

export interface ClientGateDeps {
  readonly repository: ClientAccessRepositoryPort;
  readonly rateLimiter: GalleryRateLimiterPort;
  readonly signer: ClientSessionSignerPort;
  readonly now: Date;
}

export interface ClientGateRequest {
  readonly token: string;
  readonly ip: string;
  readonly cookie: string | null;
}
