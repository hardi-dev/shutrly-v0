import "server-only";

import type { AppLocale } from "@/shared/locale/locale.types";

/** What the gate needs about the project a token belongs to (D-4). */
export interface ClientAccessRecord {
  readonly workspaceId: string;
  readonly projectId: string;
  /** The project's stored status. */
  readonly projectStatus: string;
  readonly projectTitle: string;
  readonly clientFirstName: string;
  readonly studioName: string;
  readonly galleryId: string | null;
  readonly galleryStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null;
  readonly expiresAt: Date | null;
  readonly passwordHash: string | null;
  readonly passwordVersion: number | null;
  readonly contentVersion: number | null;
  readonly finalDeliveryPublishedAt: Date | null;
}

export interface ClientAccessRepositoryPort {
  /** Token resolution: the one unscoped read (coding rules › Data access). */
  readonly findByTokenUnscoped: (token: string) => Promise<ClientAccessRecord | null>;
  /** The gallery owner's current locale for this token, read per request (D-4, never snapshotted). */
  readonly findOwnerLocaleByTokenUnscoped: (token: string) => Promise<AppLocale | null>;
}
