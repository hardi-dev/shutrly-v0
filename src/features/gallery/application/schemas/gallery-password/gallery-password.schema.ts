import { z } from "zod";

import {
  GALLERY_PASSWORD_MAX,
  GALLERY_PASSWORD_MIN,
} from "@/features/gallery/domain/gallery-password/gallery-password";

// BR-GAL-002: 6–64 characters after trimming. Shared by the forms and the actions.
export const galleryPasswordSchema = z
  .string()
  .trim()
  .min(GALLERY_PASSWORD_MIN, "TOO_SHORT")
  .max(GALLERY_PASSWORD_MAX, "TOO_LONG");
