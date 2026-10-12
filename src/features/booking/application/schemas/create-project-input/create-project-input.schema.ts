import { z } from "zod";

import {
  createAgreedPriceSchema,
  projectNotesSchema,
  projectTitleSchema,
} from "@/features/booking/domain/project-record/project-record.schema";
import { sessionInputSchema } from "@/features/booking/domain/session/session.schema";
import { SESSION_TEAM_MAX } from "@/features/booking/domain/session-assignment/session-assignment";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { assignmentInputSchema } from "../assignment-input/assignment-input.schema";
import { packageValueInputSchema } from "../package-value-input/package-value-input.schema";

// There is no status, currency, token, workspaceId or item metadata: Zod strips unknown keys (C-004).
export const createProjectInputSchema = (locale: FormattingLocale) =>
  z.object({
    mode: z.enum(["DRAFT", "BOOKED"]),
    clientId: z.uuid({ error: "REQUIRED" }),
    serviceId: z.uuid({ error: "REQUIRED" }),
    title: projectTitleSchema,
    agreedPrice: createAgreedPriceSchema(locale),
    notes: projectNotesSchema,
    items: z.array(z.object({ definitionId: z.uuid(), value: packageValueInputSchema })),
    // AC-TEAM-028: each session can carry its team; the server re-checks every pick (D-4).
    sessions: z.array(
      sessionInputSchema.and(
        z.object({ team: z.array(assignmentInputSchema).max(SESSION_TEAM_MAX).default([]) }),
      ),
    ),
    fieldValues: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])),
  });
