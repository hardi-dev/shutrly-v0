"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";

import { cn } from "@/ui/cn/cn";
import { useHydrated } from "@/ui/hooks/use-hydrated/use-hydrated";

import { LANDING_CONTACT_EMAIL } from "../landing-page/landing-page.copy";
import { postWaitlist } from "../post-waitlist/post-waitlist";
import { useWaitlistForm } from "../use-waitlist-form/use-waitlist-form";
import { WAITLIST_FORM_COPY_NAMESPACE } from "./waitlist-form.copy";
import type {
  PrivacyNoteProps,
  WaitlistBotFieldProps,
  WaitlistFormProps,
  WaitlistMessagesProps,
  WaitlistPillProps,
} from "./waitlist-form.types";

// The server's error codes, mapped to the flat copy keys (next-intl reads dots as nesting).
const ERROR_KEY = new Map<string, "errorRequired" | "errorInvalid" | "errorTooLong">([
  ["email.required", "errorRequired"],
  ["email.invalid", "errorInvalid"],
  ["email.tooLong", "errorTooLong"],
]);
const FORM_ERROR_KEY = new Map<string, "rateLimited" | "failed">([
  ["RATE_LIMITED", "rateLimited"],
  ["FAILED", "failed"],
]);
const NOTE = "text-center text-(length:--font-size-label) leading-(--font-line-height-body)";
const ERROR_NOTE = cn(NOTE, "text-(--color-semantic-status-danger-fg)");
const MUTED_NOTE = cn(NOTE, "text-(--color-semantic-text-muted)");

// The privacy note with its removal contact as a mail link (AC-LND-011).
function PrivacyNote({ className }: Readonly<PrivacyNoteProps>) {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  return (
    <p id="privacy" className={className}>
      {t.rich("privacy", {
        mail: (chunks) => (
          <a
            href={`mailto:${LANDING_CONTACT_EMAIL}`}
            className="font-medium text-(--color-semantic-text-secondary) underline underline-offset-2"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}

function WaitlistJoined() {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  const title = useRef<HTMLParagraphElement>(null);
  // Focus moves to the confirmation so screen readers announce it when the form disappears.
  useEffect(() => title.current?.focus(), []);
  return (
    <div className="flex w-full flex-col items-center gap-(--space-1) rounded-(--radius-xl) bg-(--color-semantic-surface-panel) p-(--space-5) text-center outline outline-1 -outline-offset-1 outline-(--color-semantic-border-input)">
      <p
        ref={title}
        tabIndex={-1}
        className="flex items-center gap-(--space-2) text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary) outline-none"
      >
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-(--color-semantic-accent-highlight)"
        />
        {t("successTitle")}
      </p>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {t("successBody")}
      </p>
      <PrivacyNote className={cn(MUTED_NOTE, "pt-(--space-2)")} />
    </div>
  );
}

function WaitlistPill({ id, error, isSubmitting, isReady, field }: Readonly<WaitlistPillProps>) {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  return (
    <div
      className={cn(
        "flex h-[54px] w-full items-center rounded-(--radius-full) bg-(--color-semantic-surface-panel) p-(--space-1) outline outline-1 -outline-offset-1 outline-(--color-semantic-border-input) focus-within:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)] focus-within:outline-2 focus-within:outline-(--color-semantic-focus-ring) md:h-[60px]",
        error && "outline-(--color-semantic-status-danger-fg)",
      )}
    >
      <input
        id={`${id}-email`}
        type="email"
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-full min-w-0 flex-1 bg-transparent px-(--space-4) text-(length:--font-size-body) text-(--color-semantic-text-primary) outline-none placeholder:text-(--color-semantic-text-muted) md:px-(--space-5)"
        {...field}
      />
      <button
        type="submit"
        disabled={!isReady || isSubmitting}
        className="h-full shrink-0 rounded-(--radius-full) bg-(--color-semantic-action-primary) px-(--space-5) text-(length:--font-size-body) font-semibold text-(--color-semantic-action-on-primary) hover:bg-(--color-semantic-action-primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-semantic-focus-ring) disabled:opacity-(--opacity-disabled) md:w-[178px]"
      >
        {isSubmitting ? (
          t("submitting")
        ) : (
          <>
            <span className="md:hidden">{t("submitShort")}</span>
            <span className="hidden md:inline">{t("submit")}</span>
          </>
        )}
      </button>
    </div>
  );
}

// Off-screen and aria-hidden: people and assistive tech never reach it, simple bots fill it (A-4).
function WaitlistBotField({ id, field }: Readonly<WaitlistBotFieldProps>) {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
      <label htmlFor={`${id}-website`}>{t("botLabel")}</label>
      <input id={`${id}-website`} tabIndex={-1} autoComplete="off" {...field} />
    </div>
  );
}

function WaitlistMessages({ id, error, formError }: Readonly<WaitlistMessagesProps>) {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  return (
    <>
      {error ? (
        <p id={`${id}-error`} className={ERROR_NOTE}>
          {error}
        </p>
      ) : null}
      {formError ? (
        <p role="alert" className={ERROR_NOTE}>
          {formError}
        </p>
      ) : null}
      <p className={MUTED_NOTE}>{t("promise")}</p>
      <PrivacyNote className={MUTED_NOTE} />
    </>
  );
}

/**
 * The email-only waitlist form (landing.pen sW37g / kE8Eu): a connected pill of field and button,
 * a bot field nobody sees, and the form's error, rate-limit and success states (C-007).
 * @param props - optionally, the submit function (defaults to the public waitlist endpoint)
 * @returns the form, or the confirmation once the email is on the list
 */
export function WaitlistForm({ action = postWaitlist }: Readonly<WaitlistFormProps>) {
  const t = useTranslations(WAITLIST_FORM_COPY_NAMESPACE);
  const { form, onSubmit, isSubmitting, outcome } = useWaitlistForm(action);
  const id = useId();
  const isReady = useHydrated();
  if (outcome === "JOINED") return <WaitlistJoined />;
  const errorKey = ERROR_KEY.get(form.formState.errors.email?.message ?? "");
  const error = errorKey ? t(errorKey) : undefined;
  const formKey = FORM_ERROR_KEY.get(outcome ?? "");
  const formError = formKey ? t(formKey) : undefined;
  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="relative flex w-full flex-col gap-(--space-2)"
    >
      <label htmlFor={`${id}-email`} className="sr-only">
        {t("emailLabel")}
      </label>
      <WaitlistPill
        id={id}
        error={error}
        isSubmitting={isSubmitting}
        isReady={isReady}
        field={form.register("email")}
      />
      <WaitlistBotField id={id} field={form.register("website")} />
      <WaitlistMessages id={id} error={error} formError={formError} />
    </form>
  );
}
