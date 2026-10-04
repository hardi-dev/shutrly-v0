"use server";

import { revalidatePath } from "next/cache";

import {
  createGalleryEntry,
  proposeGalleryPasswordEntry,
} from "@/composition/gallery/gallery-flow/gallery-flow";
import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";

const PROJECTS = "/w/[workspaceId]/projects";

export async function proposeGalleryPasswordAction(
  workspaceId: string,
  projectId: string,
): Promise<string> {
  return proposeGalleryPasswordEntry(workspaceId, projectId);
}

export async function createGalleryAction(
  workspaceId: string,
  projectId: string,
  values: CreateGalleryInput,
): Promise<CreateGalleryResult> {
  const result = await createGalleryEntry(workspaceId, projectId, values);
  if (result.ok) revalidatePath(PROJECTS, "layout");
  return result;
}
