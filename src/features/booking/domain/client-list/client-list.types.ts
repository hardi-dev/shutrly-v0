import type { z } from "zod";

import type { clientStatusSchema } from "./client-list.schema";

export type ClientStatus = z.output<typeof clientStatusSchema>;
