import { z } from "zod";

import { findSourceNameProblem } from "@/features/gallery/domain/source-name/source-name";

export const sourceNameSchema = z.object({
  displayName: z.string().refine((value) => findSourceNameProblem(value) === null, {
    error: (issue) =>
      typeof issue.input === "string" ? (findSourceNameProblem(issue.input) ?? "EMPTY") : "EMPTY",
  }),
});
