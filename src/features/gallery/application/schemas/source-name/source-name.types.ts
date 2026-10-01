import type { z } from "zod";

import type { sourceNameSchema } from "./source-name.schema";

export type SourceNameInput = z.input<typeof sourceNameSchema>;
