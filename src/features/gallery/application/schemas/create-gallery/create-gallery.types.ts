import type { z } from "zod";

import type { createGallerySchema } from "./create-gallery.schema";

export type CreateGalleryInput = z.input<typeof createGallerySchema>;
export type CreateGalleryValues = z.output<typeof createGallerySchema>;
