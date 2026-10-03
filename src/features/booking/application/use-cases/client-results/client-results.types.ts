import type { z } from "zod";

import type {
  ClientRecord,
  NumberHolder,
} from "../../ports/client-repository/client-repository.port";
import type { clientFieldErrorKeySchema } from "./client-results.schema";

export type ClientFieldErrorKey = z.output<typeof clientFieldErrorKeySchema>;
export interface ClientValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Partial<Record<string, ClientFieldErrorKey>>>;
  readonly numberHolder?: NumberHolder;
}
export type ClientWriteResult = { readonly ok: true } | ClientValidationFailure;
export interface ClientPage {
  readonly items: readonly ClientRecord[];
  readonly nextCursor: string | null;
}
