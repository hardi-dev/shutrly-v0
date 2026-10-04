import { z } from "zod";

import {
  DRIVE_LINK_MAX_LENGTH,
  GALLERY_SOURCE_LABEL_MAX,
} from "@/features/gallery/domain/drive-folder-link/drive-folder-link";

// AC-GAL-005, AC-GAL-009, A-3. The link's shape is checked by the domain parser.
export const linkGallerySourceSchema = z.object({
  workspaceSourceId: z.uuid("REQUIRED"),
  link: z.string().trim().min(1, "REQUIRED").max(DRIVE_LINK_MAX_LENGTH, "TOO_LONG"),
  label: z.string().trim().max(GALLERY_SOURCE_LABEL_MAX, "TOO_LONG"),
});

export const folderLinkSchema = z
  .string()
  .trim()
  .min(1, "REQUIRED")
  .max(DRIVE_LINK_MAX_LENGTH, "TOO_LONG");
