"use server";

import { redirect } from "next/navigation";

import { changeOwnPassword, updateProfileName } from "@/composition/auth/profile-flow/profile-flow";
import { updateOwnerLocale } from "@/composition/locale/locale-flow/locale-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";
import type { UpdateOwnerLocaleInput } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale.types";

export async function updateDisplayNameAction(
  values: UpdateDisplayNameInput,
): Promise<AuthFailure | undefined> {
  const result = await updateProfileName(values);
  return result.ok ? undefined : result;
}

export async function changePasswordAction(
  values: ChangePasswordInput,
): Promise<AuthFailure | undefined> {
  const result = await changeOwnPassword(values);
  if (result.ok) redirect("/profile?state=password-changed");
  return result;
}

export async function setOwnerLocaleAction(
  values: UpdateOwnerLocaleInput,
): Promise<AuthFailure | undefined> {
  const result = await updateOwnerLocale(values);
  return result.ok ? undefined : result;
}
