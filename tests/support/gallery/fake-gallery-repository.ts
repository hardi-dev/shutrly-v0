/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  GalleryCardRecord,
  GalleryPageRecord,
  GalleryPhotoRecord,
  GalleryProjectFacts,
  GalleryRepositoryPort,
  GallerySourceRecord,
  GallerySummaryRecord,
  NewGallery,
} from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import type { NewGallerySource } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { GalleryStoredStatus } from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface StoredGallery extends NewGallery {
  workspaceId: string;
  status: GalleryStoredStatus;
  passwordVersion: number;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

export interface StoredProject extends GalleryProjectFacts {
  readonly workspaceId: string;
}

export class FakeGalleryRepository implements GalleryRepositoryPort {
  readonly projects: StoredProject[] = [];
  readonly galleries: StoredGallery[] = [];
  readonly sources: (GallerySourceRecord & { galleryId: string })[] = [];
  /** Workspace sources that are active (BR-SRC-006). */
  readonly activeWorkspaceSources = new Set<string>();
  /** Folders linked while creating a gallery (Revision OT #3). */
  readonly linkedFolders: (NewGallerySource & { galleryId: string })[] = [];
  readonly photos: (GalleryPhotoRecord & { galleryId: string; workspaceId: string })[] = [];

  addProject(project: StoredProject): void {
    this.projects.push(project);
  }

  private project(context: WorkspaceContext, projectId: string) {
    return this.projects.find(
      (row) => row.workspaceId === context.workspaceId && row.id === projectId,
    );
  }

  private summary(gallery: StoredGallery): GallerySummaryRecord {
    const sources = this.sources.filter((row) => row.galleryId === gallery.id);
    const active = sources.filter((row) => row.removedAt === null);
    return {
      gallery: {
        id: gallery.id,
        status: gallery.status,
        password: gallery.password,
        passwordVersion: gallery.passwordVersion,
        expiresAt: gallery.expiresAt,
        expiryDays: gallery.expiryDays,
        publishedAt: gallery.publishedAt,
        archivedAt: gallery.archivedAt,
      },
      activeSourceCount: active.length,
      failedSourceCount: active.filter((row) => row.syncStatus === "FAILED").length,
      failedSourceNames: active
        .filter((row) => row.syncStatus === "FAILED")
        .map((row) => row.label ?? row.folderName ?? ""),
      counts: { proof: 0, edited: 0, print: 0, missing: 0 },
    };
  }

  async findProjectFacts(context: WorkspaceContext, projectId: string) {
    return this.project(context, projectId) ?? null;
  }

  async withProjectForGallery<T>(
    context: WorkspaceContext,
    projectId: string,
    work: Parameters<GalleryRepositoryPort["withProjectForGallery"]>[2],
  ): Promise<T | "NOT_FOUND"> {
    const project = this.project(context, projectId);
    if (!project) return "NOT_FOUND";
    const writer = {
      insert: async (gallery: NewGallery) => {
        if (this.galleries.some((row) => row.projectId === gallery.projectId)) {
          return "ALREADY_EXISTS" as const;
        }
        this.galleries.push({
          ...gallery,
          workspaceId: context.workspaceId,
          status: "DRAFT",
          passwordVersion: 1,
          publishedAt: null,
          archivedAt: null,
        });
        return "CREATED" as const;
      },
      isWorkspaceSourceActive: async (workspaceSourceId: string) =>
        this.activeWorkspaceSources.has(workspaceSourceId),
      insertSource: async (galleryId: string, source: NewGallerySource) => {
        this.linkedFolders.push({ ...source, galleryId });
        return { sourceId: `source-${String(this.linkedFolders.length)}` };
      },
    };
    return (await work(project, writer)) as T;
  }

  async findCard(context: WorkspaceContext, projectId: string): Promise<GalleryCardRecord | null> {
    const project = this.project(context, projectId);
    if (!project) return null;
    const gallery = this.galleries.find((row) => row.projectId === projectId);
    return { project, summary: gallery ? this.summary(gallery) : null };
  }

  async findPage(context: WorkspaceContext, projectId: string): Promise<GalleryPageRecord | null> {
    const project = this.project(context, projectId);
    const gallery = this.galleries.find((row) => row.projectId === projectId);
    if (!project || !gallery) return null;
    const sources = this.sources.filter((row) => row.galleryId === gallery.id);
    const previewPhotos = this.photos.filter((row) => row.galleryId === gallery.id).slice(0, 8);
    return { project, summary: this.summary(gallery), sources, previewPhotos };
  }

  async findMediaPhoto(context: WorkspaceContext, photoId: string) {
    const photo = this.photos.find(
      (row) => row.id === photoId && row.workspaceId === context.workspaceId,
    );
    if (!photo) return null;
    const source = this.sources.find((row) => row.id === photo.sourceId);
    return {
      externalFileId: photo.externalFileId,
      resourceKey: photo.resourceKey,
      missing: photo.missing,
      sourceRemoved: source?.removedAt != null,
    };
  }
}
/* eslint-enable @typescript-eslint/require-await -- end of the fake */
