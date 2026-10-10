import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { updateOwnerLocaleSchema } from "./update-owner-locale.schema";

export type UpdateOwnerLocaleInput = z.input<typeof updateOwnerLocaleSchema>;

export type UpdateOwnerLocaleResult = AuthResult;
