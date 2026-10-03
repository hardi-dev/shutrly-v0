import type { z } from "zod";

import type { clientSearchSchema } from "./client-search.schema";

export type ClientSearch = z.output<typeof clientSearchSchema>;
