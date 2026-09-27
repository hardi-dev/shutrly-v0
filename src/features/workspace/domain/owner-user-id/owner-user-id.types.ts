import type { z } from "zod";

import type { ownerUserIdSchema } from "./owner-user-id.schema";

export type OwnerUserId = z.infer<typeof ownerUserIdSchema>;
