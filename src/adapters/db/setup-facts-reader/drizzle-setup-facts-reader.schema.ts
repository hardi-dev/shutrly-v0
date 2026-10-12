import { z } from "zod";

export const setupFactsRowSchema = z.object({
  has_project: z.boolean(),
  active_service_count: z.number().int().min(0).max(2),
  first_active_service_id: z.uuid().nullable(),
  has_selection_item: z.boolean(),
  has_brand_name: z.boolean(),
});
