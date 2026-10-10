import type { z } from "zod";

import type { setFolderMappingSchema } from "./folder-mapping.schema";

export type SetFolderMappingInput = z.input<typeof setFolderMappingSchema>;
