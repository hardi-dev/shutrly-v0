import { z } from "zod";

import {
  CURSOR_MAX_ID,
  CURSOR_MAX_QUEUE,
  CURSOR_MAX_TEXT,
  MAX_SYNC_PHOTOS,
  SYNC_MAX_DEPTH,
} from "@/features/gallery/domain/photo-classification/photo-classification";

// TD D-20: the JSONB of an open sync run; a failed parse ends the run as UNAVAILABLE and the next
// sync starts fresh.
const cursorFolderSchema = z.object({
  folderId: z.string().min(1).max(CURSOR_MAX_ID),
  resourceKey: z.string().min(1).max(CURSOR_MAX_ID).nullable(),
  segments: z.array(z.string().max(CURSOR_MAX_TEXT)).max(SYNC_MAX_DEPTH),
  pageToken: z.string().min(1).max(CURSOR_MAX_TEXT).nullable(),
});

export const syncCursorSchema = z.object({
  folderName: z.string().max(CURSOR_MAX_TEXT),
  queue: z.array(cursorFolderSchema).max(CURSOR_MAX_QUEUE),
  seen: z.array(z.string().min(1).max(CURSOR_MAX_ID)).max(MAX_SYNC_PHOTOS),
  ignoredCount: z.number().int().min(0),
  tooDeepCount: z.number().int().min(0),
  foldersDone: z.number().int().min(0),
  listCalls: z.number().int().min(0),
});
