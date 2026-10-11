"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Alert } from "@/ui/patterns/alert/alert";

import { AUTH_ERROR_COPY_NAMESPACE } from "./auth-error-alert.copy";
import type { AuthErrorAlertProps } from "./auth-error-alert.types";

/**
 * A form-level error as a live, title-only Danger Alert (auth.pen DjUek) that takes focus when
 * it appears (AC-AUTH-023). It never names the account or which field was wrong (A-5).
 * @param props - the error code
 * @returns the alert
 */
export function AuthErrorAlert({ code }: Readonly<AuthErrorAlertProps>) {
  const t = useTranslations(AUTH_ERROR_COPY_NAMESPACE);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [code]);
  return <Alert ref={ref} tone="danger" title={t(code)} live />;
}
