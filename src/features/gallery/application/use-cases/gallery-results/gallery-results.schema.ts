import { z } from "zod";

export const galleryFieldErrorKeySchema = z
  .enum([
    "REQUIRED",
    "INVALID",
    "TOO_SHORT",
    "TOO_LONG",
    "NOT_WHOLE",
    "OUT_OF_RANGE",
    "PAST_DATE",
    "NOT_DRIVE",
    "NOT_A_FOLDER",
    "FOLDER_ALREADY_LINKED",
    "SOURCE_NOT_ACTIVE",
  ])
  .catch("INVALID");
