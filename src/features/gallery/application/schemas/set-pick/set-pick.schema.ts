import { z } from "zod";

import { BULK_PICK_MAX } from "@/features/gallery/domain/selection-usage/selection-usage";

// A pick change from Pilih, Tinjau or the viewer; quantity 0 un-picks (D-12).
export const setPickSchema = z.object({
  groupId: z.uuid(),
  photoId: z.uuid(),
  quantity: z.int().min(0).max(999),
});

// A note change on a pick; the domain trims it and checks the 500-character limit (A-32).
export const setPickNoteSchema = z.object({
  groupId: z.uuid(),
  photoId: z.uuid(),
  note: z.string().max(2000),
});

// F-20: *Pilih untuk…* on several photos of *Semua foto* at once; each new pick is × 1.
export const setPicksSchema = z.object({
  groupId: z.uuid(),
  photoIds: z.array(z.uuid()).min(1).max(BULK_PICK_MAX),
});
