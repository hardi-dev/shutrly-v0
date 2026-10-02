import { z } from "zod";

import { findCatalogNameProblem } from "@/features/booking/domain/catalog-name/catalog-name";

export const catalogNameSchema = z.object({
  name: z.string().refine((value) => findCatalogNameProblem(value) === null, {
    error: (issue) =>
      typeof issue.input === "string" ? (findCatalogNameProblem(issue.input) ?? "EMPTY") : "EMPTY",
  }),
});
