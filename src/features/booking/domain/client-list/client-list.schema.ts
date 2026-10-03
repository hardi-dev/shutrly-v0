import { z } from "zod";

import { CLIENT_STATUSES } from "./client-list";

/** BR-CLI-003: an untrusted list status. */
export const clientStatusSchema = z.enum(CLIENT_STATUSES);
