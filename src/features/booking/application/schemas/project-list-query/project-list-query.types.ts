import type { z } from "zod";

import type { projectListQuerySchema } from "./project-list-query.schema";

export type ProjectListQuery = z.output<typeof projectListQuerySchema>;
