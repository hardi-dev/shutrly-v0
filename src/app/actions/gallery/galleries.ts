"use server";

import { revalidatePath } from "next/cache";

import {
  createGalleryEntry,
  proposeGalleryPasswordEntry,
} from "@/composition/gallery/gallery-flow/gallery-flow";
import {
  checkFolderInUseEntry,
  linkGallerySourceEntry,
  syncGallerySourceEntry,
} from "@/composition/gallery/gallery-source-flow/gallery-source-flow";
import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { LinkGallerySourceInput } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { FolderUseResult } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { LinkGallerySourceResult } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source.types";
import type { SyncOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source/sync-gallery-source.types";

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

export async function checkFolderInUseAction(
  workspaceId: string,
  galleryId: string,
  link: string,
): Promise<FolderUseResult> {
  return checkFolderInUseEntry(workspaceId, galleryId, link);
}

export async function linkGallerySourceAction(
  workspaceId: string,
  galleryId: string,
  values: LinkGallerySourceInput,
): Promise<LinkGallerySourceResult> {
  const result = await linkGallerySourceEntry(workspaceId, galleryId, values);
  if (result.ok) revalidatePath(PROJECTS, "layout");
  return result;
}

export async function syncGallerySourceAction(
  workspaceId: string,
  sourceId: string,
): Promise<SyncOutcome> {
  const result = await syncGallerySourceEntry(workspaceId, sourceId);
  revalidatePath(PROJECTS, "layout");
  return result;
}
