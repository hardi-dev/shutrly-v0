import { z } from "zod";

export const driveFileSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  mimeType: z.string(),
  resourceKey: z.string().optional(),
});

export const driveListSchema = z.object({
  files: z.array(driveFileSchema).default([]),
  nextPageToken: z.string().optional(),
});

export const driveThumbnailSchema = z.object({ thumbnailLink: z.string().optional() });

export const driveErrorSchema = z.object({
  error: z.object({ errors: z.array(z.object({ reason: z.string().optional() })).optional() }),
});
