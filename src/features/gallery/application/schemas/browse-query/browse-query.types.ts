import type { z } from "zod";

import type { browseQuerySchema } from "./browse-query.schema";

export type BrowseQuery = z.input<typeof browseQuerySchema>;
