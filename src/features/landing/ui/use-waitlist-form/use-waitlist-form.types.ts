import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import type {
  JoinWaitlistInput,
  JoinWaitlistResult,
} from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";

export type WaitlistAction = (input: JoinWaitlistInput) => Promise<JoinWaitlistResult>;

/** The last answer that changes the form as a whole; field errors live on the field. */
export type WaitlistOutcome = "JOINED" | "RATE_LIMITED" | "FAILED" | null;

export interface WaitlistFormController {
  form: UseFormReturn<JoinWaitlistInput>;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  isSubmitting: boolean;
  outcome: WaitlistOutcome;
}
