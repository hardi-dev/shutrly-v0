import { z } from "zod";

import {
  agreedPriceSchema,
  projectNotesSchema,
  projectTitleSchema,
} from "@/features/booking/domain/project-record/project-record.schema";
import { sessionInputSchema } from "@/features/booking/domain/session/session.schema";

import { packageValueInputSchema } from "../package-value-input/package-value-input.schema";

// There is no status, currency, token, workspaceId or item metadata: Zod strips unknown keys (C-004).
export const createProjectInputSchema = z.object({
  mode: z.enum(["DRAFT", "BOOKED"]),
  clientId: z.uuid({ error: "REQUIRED" }),
  serviceId: z.uuid({ error: "REQUIRED" }),
  title: projectTitleSchema,
  agreedPrice: agreedPriceSchema,
  notes: projectNotesSchema,
  items: z.array(z.object({ definitionId: z.uuid(), value: packageValueInputSchema })),
  sessions: z.array(sessionInputSchema),
  fieldValues: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])),
});
