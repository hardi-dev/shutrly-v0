import { z } from "zod";

import {
  findDefinitionTypeProblem,
  PICK_MODES,
  UNIT_MAX_LENGTH,
  VALUE_TYPES,
} from "@/features/booking/domain/item-definition-type/item-definition-type";

import { catalogNameSchema } from "../catalog-name/catalog-name.schema";

export const itemDefinitionSchema = catalogNameSchema
  .extend({
    valueType: z.enum(VALUE_TYPES),
    unit: z
      .string()
      .transform((value) => (value.trim().length === 0 ? null : value.trim()))
      .refine((value) => value === null || Array.from(value).length <= UNIT_MAX_LENGTH, {
        error: "UNIT_TOO_LONG",
      }),
    selectionRequired: z.boolean(),
    pickMode: z.enum(PICK_MODES).nullable(),
    allowsPickNotes: z.boolean(),
  })
  .superRefine((value, context) => {
    const problem = findDefinitionTypeProblem(value);
    if (problem === "SELECTION_NEEDS_NUMBER") {
      context.addIssue({ code: "custom", path: ["valueType"], message: problem });
    } else if (problem === "PICK_NOTES_UNEXPECTED") {
      context.addIssue({ code: "custom", path: ["allowsPickNotes"], message: problem });
    } else if (problem) {
      context.addIssue({ code: "custom", path: ["pickMode"], message: problem });
    }
  });
