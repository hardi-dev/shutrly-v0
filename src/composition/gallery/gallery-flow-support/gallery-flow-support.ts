import "server-only";

import { notFound } from "next/navigation";
import { z } from "zod";

import { GalleryError } from "@/features/gallery/application/errors/gallery-errors/gallery-errors";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

const idSchema = z.uuid();

/** Maps a failed gallery entry: NOT_FOUND to the 404 page, anything else to SAVE_FAILED, logging IDs and the operation only (C-103). @param error - the thrown error @param workspaceId - the verified workspace @param operation - a short operation name @returns never */
export function gallerySaveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof GalleryError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError))
    logger.error("gallery.save_failed", { workspaceId, operation });
  throw new GalleryError("SAVE_FAILED");
}

/** Parses an untrusted route or action ID, or shows the 404 page. @param rawId - the untrusted ID @returns the UUID */
export function galleryIdOrNotFound(rawId: string): string {
  const parsed = idSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}
