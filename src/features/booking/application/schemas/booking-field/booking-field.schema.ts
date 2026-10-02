import { z } from "zod";

import {
  FIELD_TYPES,
  findOptionsProblem,
} from "@/features/booking/domain/booking-field/booking-field";

import { catalogNameSchema } from "../catalog-name/catalog-name.schema";

export const bookingFieldSchema = catalogNameSchema
  .extend({
    fieldType: z.enum(FIELD_TYPES),
    isRequired: z.boolean(),
    options: z.array(z.string()).nullable(),
  })
  .superRefine((value, context) => {
    if (value.fieldType === "SELECT") {
      const problem = findOptionsProblem(value.options ?? []);
      if (problem === null) return;
      if ("index" in problem) {
        context.addIssue({
          code: "custom",
          path: ["options", problem.index],
          message: problem.problem,
        });
      } else {
        context.addIssue({ code: "custom", path: ["options"], message: problem.problem });
      }
      return;
    }
    if (value.options !== null) {
      context.addIssue({ code: "custom", path: ["options"], message: "OPTIONS_UNEXPECTED" });
    }
  });
