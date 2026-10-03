import { z } from "zod";

const statusSchema = z.enum([
  "DRAFT",
  "BOOKED",
  "SHOOTING",
  "POST_PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
]);

const filterSchema = z.object({
  statuses: z.array(statusSchema).default([]),
  from: z.string().nullable().default(null),
  to: z.string().nullable().default(null),
  includeNoSchedule: z.boolean().default(false),
  serviceIds: z.array(z.uuid()).default([]),
  clientId: z.uuid().nullable().default(null),
});

export const projectListQuerySchema = z.object({
  tab: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  /** Left unbounded here so an invalid search lists unfiltered in the use case. */
  q: z.string().default(""),
  afterId: z.uuid().nullable().default(null),
  filter: filterSchema.default({
    statuses: [],
    from: null,
    to: null,
    includeNoSchedule: false,
    serviceIds: [],
    clientId: null,
  }),
});
