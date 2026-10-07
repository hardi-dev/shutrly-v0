"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { joinWaitlistSchema } from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.schema";
import type {
  JoinWaitlistInput,
  JoinWaitlistResult,
} from "@/features/landing/application/use-cases/join-waitlist/join-waitlist.types";

import type {
  WaitlistAction,
  WaitlistFormController,
  WaitlistOutcome,
} from "./use-waitlist-form.types";

const FAILED: JoinWaitlistResult = { status: "FAILED" };

/**
 * React Hook Form for the waitlist: the shared schema checks the email in the browser (UX only;
 * the server checks again, C-004), and the server's answer becomes a field error or an outcome.
 * A thrown or rejected action counts as a failure, so the typed email stays (AC-LND-010).
 * @param action - the waitlist server action
 * @returns the form, its submit handler, the submitting flag and the last outcome
 */
export function useWaitlistForm(action: WaitlistAction): WaitlistFormController {
  const [outcome, setOutcome] = useState<WaitlistOutcome>(null);
  const form = useForm<JoinWaitlistInput, unknown, JoinWaitlistInput>({
    resolver: zodResolver(joinWaitlistSchema),
    defaultValues: { email: "", website: "" },
    shouldFocusError: true,
  });

  function apply(result: JoinWaitlistResult): void {
    if (result.status === "INVALID") {
      form.setError(result.field, { type: "server", message: result.error }, { shouldFocus: true });
      return;
    }
    setOutcome(result.status);
  }

  async function submit(values: JoinWaitlistInput): Promise<void> {
    setOutcome(null);
    apply(await action(values).catch(() => FAILED));
  }

  function markFailed(): void {
    setOutcome("FAILED");
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(markFailed);
  }

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting, outcome };
}
