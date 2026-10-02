import type { z } from "zod";

import type { addSourceSchema } from "./add-source.schema";

export type AddSourceInput = z.input<typeof addSourceSchema>;
