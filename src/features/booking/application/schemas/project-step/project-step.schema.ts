import { z } from "zod";

/** The steps the entry point accepts; MARK_DELIVERED is routed to the delivery transaction (AC-GFL-017). */
export const projectStepSchema = z.enum([
  "CONFIRM_BOOKING",
  "START_SHOOTING",
  "FINISH_SHOOTING",
  "MARK_DELIVERED",
]);

/** The status steps `advanceProject` may move; anything else, MARK_DELIVERED included, is a forged step. */
export const manualProjectStepSchema = z.enum([
  "CONFIRM_BOOKING",
  "START_SHOOTING",
  "FINISH_SHOOTING",
]);
