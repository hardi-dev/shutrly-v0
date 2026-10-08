export interface ClientSessionPayload {
  readonly v: 1;
  /** 32 hex chars, random; keys the selection-write limit. */
  readonly sid: string;
  readonly projectId: string;
  readonly galleryId: string;
  /** gallery.password_version at sign-in. */
  readonly pv: number;
  /** First 32 hex chars of sha256(token). */
  readonly th: string;
  /** Epoch seconds. */
  readonly exp: number;
}

export interface SessionCheckInput {
  readonly payload: ClientSessionPayload;
  readonly projectId: string;
  readonly galleryId: string;
  readonly passwordVersion: number;
  readonly tokenHash: string;
  readonly nowSeconds: number;
}
