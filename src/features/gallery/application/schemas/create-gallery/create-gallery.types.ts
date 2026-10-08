import type { z } from "zod";

import type { createGalleryFormSchema, createGallerySchema } from "./create-gallery.schema";

export type CreateGalleryInput = z.input<typeof createGallerySchema>;
export type CreateGalleryValues = z.output<typeof createGallerySchema>;
export type CreateGalleryFormInput = z.input<typeof createGalleryFormSchema>;
export type CreateGalleryFormValues = z.output<typeof createGalleryFormSchema>;
