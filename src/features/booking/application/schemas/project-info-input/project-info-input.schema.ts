import { z } from "zod";

import {
  agreedPriceSchema,
  cancelReasonSchema,
  projectNotesSchema,
  projectTitleSchema,
} from "@/features/booking/domain/project-record/project-record.schema";

export const projectInfoInputSchema = z.object({
  title: projectTitleSchema,
  agreedPrice: agreedPriceSchema,
  notes: projectNotesSchema,
});

export const cancelProjectInputSchema = z.object({ reason: cancelReasonSchema });
