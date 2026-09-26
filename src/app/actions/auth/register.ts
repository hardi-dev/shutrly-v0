"use server";

import { redirect } from "next/navigation";

import { register, resendVerificationEmail } from "@/composition/auth/register-flow/register-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export async function registerAction(values: RegisterOwnerInput): Promise<AuthFailure | undefined> {
  const result = await register(values);
  if (result.ok) redirect("/verify");
  return result;
}

export async function resendVerificationAction(): Promise<ResendVerificationResult> {
  const result = await resendVerificationEmail();
  if (!result) redirect("/login");
  return result;
}
