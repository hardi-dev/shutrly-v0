import { z } from "zod";

import { GALLERY_SOURCE_LABEL_MAX } from "@/features/gallery/domain/drive-folder-link/drive-folder-link";

// AC-GAL-037: an empty label shows the folder name again.
export const renameGallerySourceSchema = z.object({
  label: z.string().trim().max(GALLERY_SOURCE_LABEL_MAX, "TOO_LONG"),
});
