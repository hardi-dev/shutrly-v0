import type { z } from "zod";

import type { linkGallerySourceSchema } from "./link-gallery-source.schema";

export type LinkGallerySourceInput = z.input<typeof linkGallerySourceSchema>;
export type LinkGallerySourceValues = z.output<typeof linkGallerySourceSchema>;
