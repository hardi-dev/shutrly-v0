import { z } from "zod";

import {
  DRIVE_LINK_MAX_LENGTH,
  GALLERY_SOURCE_LABEL_MAX,
} from "@/features/gallery/domain/drive-folder-link/drive-folder-link";

import { galleryExpirySchema } from "../gallery-expiry/gallery-expiry.schema";
import { galleryPasswordSchema } from "../gallery-password/gallery-password.schema";
import { linkGallerySourceSchema } from "../link-gallery-source/link-gallery-source.schema";

// Revision OT #3: the first folder is optional and validated like *Tambah folder*.
export const createGallerySchema = z.object({
  password: galleryPasswordSchema,
  expiry: galleryExpirySchema,
  folder: linkGallerySourceSchema.optional(),
});

// The *Buat galeri* form (Revision OT #3): the folder section may stay empty; an empty link sends no
// folder, and the server validates whatever is sent with `createGallerySchema`.
export const createGalleryFormSchema = z.object({
  password: galleryPasswordSchema,
  expiry: galleryExpirySchema,
  folder: z.object({
    workspaceSourceId: z.string(),
    link: z.string().trim().max(DRIVE_LINK_MAX_LENGTH, "TOO_LONG"),
    label: z.string().trim().max(GALLERY_SOURCE_LABEL_MAX, "TOO_LONG"),
  }),
});
