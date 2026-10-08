import type { z } from "zod";

import type { renameGallerySourceSchema } from "./rename-gallery-source.schema";

export type RenameGallerySourceInput = z.input<typeof renameGallerySourceSchema>;
export type RenameGallerySourceValues = z.output<typeof renameGallerySourceSchema>;
