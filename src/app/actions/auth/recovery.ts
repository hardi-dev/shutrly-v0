"use server";

import { redirect } from "next/navigation";

import { requestReset, resetWithLink } from "@/composition/auth/recovery-flow/recovery-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { RequestPasswordResetInput } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";
import type { ResetPasswordInput } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

export async function forgotPasswordAction(
  values: RequestPasswordResetInput,
): Promise<AuthFailure | undefined> {
  const result = await requestReset(values);
  if (result.ok) redirect("/forgot-password?state=sent");
  return result;
}

export async function resetPasswordAction(
  values: ResetPasswordInput,
): Promise<AuthFailure | undefined> {
  const result = await resetWithLink(values);
  if (result.ok) redirect("/login");
  if (result.code === "INVALID_LINK") redirect("/reset-password?state=invalid");
  return result;
}
