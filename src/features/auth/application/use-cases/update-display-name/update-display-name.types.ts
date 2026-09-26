import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { updateDisplayNameSchema } from "./update-display-name.schema";

export type UpdateDisplayNameInput = z.input<typeof updateDisplayNameSchema>;

export type UpdateDisplayNameResult = AuthResult;
