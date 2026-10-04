"use server";

import { revalidatePath } from "next/cache";

import {
  createGalleryEntry,
  proposeGalleryPasswordEntry,
} from "@/composition/gallery/gallery-flow/gallery-flow";
import {
  archiveGalleryEntry,
  browseGalleryPhotosEntry,
  checkFolderInUseEntry,
  deleteDraftGalleryEntry,
  linkGallerySourceEntry,
  publishGalleryEntry,
  removeGallerySourceEntry,
  rotateGalleryPasswordEntry,
  setGalleryExpiryEntry,
  syncGallerySourceEntry,
} from "@/composition/gallery/gallery-source-flow/gallery-source-flow";
import type { BrowseQuery } from "@/features/gallery/application/schemas/browse-query/browse-query.types";
import type { CreateGalleryInput } from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { LinkGallerySourceInput } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { RotateGalleryPasswordInput } from "@/features/gallery/application/schemas/rotate-gallery-password/rotate-gallery-password.types";
import type { SetGalleryExpiryInput } from "@/features/gallery/application/schemas/set-gallery-expiry/set-gallery-expiry.types";
import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";
import type { FolderUseResult } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type {
  ExpiryResult,
  GalleryWriteResult,
  PublishResult,
} from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { LinkGallerySourceResult } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source.types";
import type { SyncStepOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";

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
): Promise<SyncStepOutcome> {
  const result = await syncGallerySourceEntry(workspaceId, sourceId);
  // A step in the middle of a run changes nothing the page shows; re-rendering it per step would
  // spend the request's CPU on a page the browser refreshes once the run ends (ADR-018).
  if (!result.ok || result.status !== "CONTINUE") revalidatePath(PROJECTS, "layout");
  return result;
}

export async function browseGalleryPhotosAction(
  workspaceId: string,
  galleryId: string,
  query: BrowseQuery,
): Promise<BrowsePageView> {
  return browseGalleryPhotosEntry(workspaceId, galleryId, query);
}

export async function publishGalleryAction(
  workspaceId: string,
  galleryId: string,
): Promise<PublishResult> {
  const result = await publishGalleryEntry(workspaceId, galleryId);
  revalidatePath(PROJECTS, "layout");
  return result;
}

export async function setGalleryExpiryAction(
  workspaceId: string,
  galleryId: string,
  values: SetGalleryExpiryInput,
): Promise<ExpiryResult> {
  const result = await setGalleryExpiryEntry(workspaceId, galleryId, values);
  revalidatePath(PROJECTS, "layout");
  return result;
}

export async function rotateGalleryPasswordAction(
  workspaceId: string,
  galleryId: string,
  values: RotateGalleryPasswordInput,
): Promise<GalleryWriteResult> {
  const result = await rotateGalleryPasswordEntry(workspaceId, galleryId, values);
  revalidatePath(PROJECTS, "layout");
  return result;
}

export async function removeGallerySourceAction(
  workspaceId: string,
  sourceId: string,
): Promise<GalleryWriteResult> {
  const result = await removeGallerySourceEntry(workspaceId, sourceId);
  revalidatePath(PROJECTS, "layout");
  return result;
}

export async function archiveGalleryAction(
  workspaceId: string,
  galleryId: string,
): Promise<GalleryWriteResult> {
  const result = await archiveGalleryEntry(workspaceId, galleryId);
  revalidatePath(PROJECTS, "layout");
  return result;
}

export async function deleteDraftGalleryAction(
  workspaceId: string,
  galleryId: string,
): Promise<GalleryWriteResult> {
  const result = await deleteDraftGalleryEntry(workspaceId, galleryId);
  revalidatePath(PROJECTS, "layout");
  return result;
}
