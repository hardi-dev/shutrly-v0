import { z } from "zod";

import {
  findTemplateProblem,
  problemKeyFor,
} from "@/features/communications/domain/template-content/template-content";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

// One schema for the editor form (UX) and the save use case (C-004). The issue message is the
// problem key that the UI translates.
export const messageTemplateContentSchema = (type: TemplateType) =>
  z.object({
    content: z.string().refine((value) => findTemplateProblem(type, value) === null, {
      error: (issue) => problemKeyFor(type, issue.input),
    }),
  });
