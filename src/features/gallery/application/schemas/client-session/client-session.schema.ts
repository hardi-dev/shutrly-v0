import { z } from "zod";

// The signed cookie payload (ADR-023, D-3); parsed only after the MAC holds.
export const clientSessionPayloadSchema = z.strictObject({
  v: z.literal(1),
  sid: z.string().regex(/^[0-9a-f]{32}$/),
  projectId: z.uuid(),
  galleryId: z.uuid(),
  pv: z.int().positive(),
  th: z.string().regex(/^[0-9a-f]{32}$/),
  exp: z.int().positive(),
});
