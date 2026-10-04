import type { z } from "zod";

import type { rotateGalleryPasswordSchema } from "./rotate-gallery-password.schema";

export type RotateGalleryPasswordInput = z.input<typeof rotateGalleryPasswordSchema>;
export type RotateGalleryPasswordValues = z.output<typeof rotateGalleryPasswordSchema>;
