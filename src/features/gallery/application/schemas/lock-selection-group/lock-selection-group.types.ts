import type { z } from "zod";

import type { lockSelectionGroupSchema } from "./lock-selection-group.schema";

export type LockSelectionGroupInput = z.input<typeof lockSelectionGroupSchema>;
