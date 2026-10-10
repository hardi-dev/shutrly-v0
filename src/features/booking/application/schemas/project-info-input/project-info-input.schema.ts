import { z } from "zod";

import {
  cancelReasonSchema,
  createAgreedPriceSchema,
  projectNotesSchema,
  projectTitleSchema,
} from "@/features/booking/domain/project-record/project-record.schema";
import type { FormattingLocale } from "@/shared/locale/locale.types";

export const createProjectInfoInputSchema = (locale: FormattingLocale) =>
  z.object({
    title: projectTitleSchema,
    agreedPrice: createAgreedPriceSchema(locale),
    notes: projectNotesSchema,
  });

export const cancelProjectInputSchema = z.object({ reason: cancelReasonSchema });
