import type { z } from "zod";

import type { clientListQuerySchema } from "./client-list-query.schema";

export type ClientListQuery = z.output<typeof clientListQuerySchema>;
