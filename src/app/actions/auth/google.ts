"use server";

import { redirect } from "next/navigation";

import { startGoogle } from "@/composition/auth/google-flow/google-flow";

export async function startGoogleAction(): Promise<void> {
  redirect(await startGoogle());
}
