import type { z } from "zod";

import type { submitSelectionGroupSchema } from "./submit-selection-group.schema";

export type SubmitSelectionGroupInput = z.input<typeof submitSelectionGroupSchema>;
