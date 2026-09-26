import { z } from "zod";

import { displayNameFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

// Only `name` is accepted; unknown keys such as `email` are stripped (AC-AUTH-020).
export const updateDisplayNameSchema = z.object({ name: displayNameFieldSchema });
