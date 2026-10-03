import type { z } from "zod";

import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";

import type { projectListQuerySchema } from "./project-list-query.schema";

export type ProjectListQuery = Omit<z.output<typeof projectListQuerySchema>, "filter"> & {
  readonly filter: ProjectFilter;
};
