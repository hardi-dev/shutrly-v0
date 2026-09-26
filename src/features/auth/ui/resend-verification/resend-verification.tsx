"use client";

import { useEffect, useState } from "react";

import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { RESEND_VERIFICATION_COPY as COPY } from "./resend-verification.copy";
import type { CooldownProps, ResendVerificationProps } from "./resend-verification.types";

/** A-6: the resend button's cooldown. UX only; the server rate limit is the authority. */
const COOLDOWN_SECONDS = 60;
const SECOND_MS = 1000;

function Cooldown({ secondsLeft }: Readonly<CooldownProps>) {
  return (
    <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      {COPY.cooldownPrefix} {secondsLeft} {COPY.cooldownSuffix}
    </p>
  );
}

/**
 * The resend-verification control with its 60 s cooldown (AC-AUTH-006) and a retryable
 * delivery failure (AC-AUTH-022).
 * @param props - the resend server action and an optional button label
 * @returns the control
 */
export function ResendVerification({
  action,
  label = COPY.resend,
}: Readonly<ResendVerificationProps>) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [crash, setCrash] = useState<Error | null>(null);
  // An unexpected failure goes to the route's error boundary (C-007), never swallowed.
  if (crash) throw crash;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, SECOND_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  async function resend(): Promise<void> {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.ok) setSecondsLeft(COOLDOWN_SECONDS);
    else setError(result.code);
  }

  function fail(caught: unknown): void {
    setCrash(caught instanceof Error ? caught : new Error("Resend failed"));
  }

  function handlePress(): void {
    resend().catch(fail);
  }

  return (
    <div className="flex flex-col gap-(--space-3)">
      {error ? <AuthErrorAlert code={error} /> : null}
      {secondsLeft > 0 ? <Alert tone="info" title={COPY.sent} live /> : null}
      <Button
        variant="secondary"
        size="lg"
        isDisabled={busy || secondsLeft > 0}
        onPress={handlePress}
      >
        {label}
      </Button>
      {secondsLeft > 0 ? <Cooldown secondsLeft={secondsLeft} /> : null}
    </div>
  );
}
