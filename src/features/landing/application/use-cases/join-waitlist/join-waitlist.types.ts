import type { z } from "zod";

import type { WaitlistStorePort } from "../../ports/waitlist-store/waitlist-store.port";
import type {
  joinWaitlistResultSchema,
  joinWaitlistSchema,
  waitlistFieldErrorSchema,
} from "./join-waitlist.schema";

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

export type WaitlistFieldError = z.infer<typeof waitlistFieldErrorSchema>;

/** What a waitlist submission tells the visitor; never anything about the stored entry (C-006). */
export type JoinWaitlistResult = z.infer<typeof joinWaitlistResultSchema>;

export type WaitlistFailure =
  { reason: "NOT_CONFIGURED" } | { reason: "STORE_FAILED"; status: number | undefined };

export interface JoinWaitlistDeps {
  /** Null when the environment has no waitlist key or segment (AC-LND-018). */
  store: WaitlistStorePort | null;
  /** Called once per failure, for logging without the email (C-006). */
  onFailure: (failure: WaitlistFailure) => void;
}
