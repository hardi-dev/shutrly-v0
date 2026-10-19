"use server";

import { loadGalleryShareEntry } from "@/composition/gallery/gallery-share-flow/gallery-share-flow";
import type { GalleryShareEntry } from "@/composition/gallery/gallery-share-flow/gallery-share-flow.types";

/**
 * Loads the share dialog's message for a project's gallery (AC-GFL-021 to 025). Read-only: nothing is
 * sent or stored, and the message and password are never logged.
 * @param workspaceId - the route workspace id (verified in the composition)
 * @param projectId - the project id
 * @returns the message, or a refusal code
 */
export async function loadGalleryShareAction(
  workspaceId: string,
  projectId: string,
): Promise<GalleryShareEntry> {
  return loadGalleryShareEntry(workspaceId, projectId);
}
