"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/composition/auth/login-flow/login-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

export async function loginAction(values: LoginOwnerInput): Promise<AuthFailure | undefined> {
  const result = await login(values);
  if (result.ok) redirect(result.outcome.path);
  if (result.code === "ACCOUNT_UNAVAILABLE") redirect("/account-unavailable");
  return result;
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}
