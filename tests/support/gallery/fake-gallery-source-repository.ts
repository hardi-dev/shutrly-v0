/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  FolderMapEntry,
  GallerySourceRepositoryPort,
  LockedGalleryState,
  MappableItem,
  NewGallerySource,
  SyncClaim,
  SyncStepResult,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import { classifyPhoto } from "@/features/gallery/domain/photo-classification/photo-classification";
import type { FolderMapping } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type {
  SyncedPhoto,
  SyncFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { SyncCursor } from "@/features/gallery/domain/sync-step/sync-step.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface FakeSource extends NewGallerySource {
  id: string;
  workspaceId: string;
  galleryId: string;
  removed: boolean;
  syncStatus: string;
  syncErrorCode: SyncFailureCode | null;
  startedAt: Date | null;
  leaseAt: Date | null;
  cursor: SyncCursor | null;
  folderName: string | null;
  label: string | null;
}

export interface FakePhoto extends SyncedPhoto {
  sourceId: string;
  missing: boolean;
}

export interface FakeGallery extends LockedGalleryState {
  workspaceId: string;
  passwordVersion: number;
  passwordHash: string;
  passwordChangedBy: string | null;
  archivedBy: string | null;
  deleted: boolean;
}

/** The fake Drive fixture's finished folders, mapped to two package items (F-20). */
export const FIXTURE_FOLDER_MAPPINGS: readonly FolderMapping[] = [
  { path: "Edited", kind: "EDITED", projectItemId: "item-edited" },
  { path: "print", kind: "PRINT", projectItemId: "item-print" },
];

export class FakeGallerySourceRepository implements GallerySourceRepositoryPort {
  readonly galleries = new Map<string, FakeGallery>();
  readonly activeWorkspaceSources = new Set<string>();
  readonly sources: FakeSource[] = [];
  readonly photos: FakePhoto[] = [];
  /** Photo rows a step wrote (inserted or changed): an unchanged photo adds none (D-21). */
  photoWrites = 0;
  readonly otherProjectFolders = new Map<string, string[]>();
  /** Subfolder mappings per source (F-20). */
  readonly mappings = new Map<string, FolderMapping[]>();
  /** The fixture's `Edited` and `print` folders mapped, so tests keep their finished files (F-20). */
  defaultMappings: readonly FolderMapping[] = FIXTURE_FOLDER_MAPPINGS;
  readonly knownFolders = new Map<string, string[]>();
  readonly savedMappings = new Map<string, readonly FolderMapEntry[]>();
  /** The project's selection items offered for mapping (F-20). */
  mappableItems: readonly MappableItem[] = [
    { id: "item-edited", name: "Foto edit", pickMode: "COUNT" },
    { id: "item-print", name: "Foto cetak", pickMode: "QUANTITY" },
  ];
  /** Sources with a client pick of one of their photos (BR-GAL-009). */
  readonly pickedSources = new Set<string>();
  private next = 0;

  addGallery(workspaceId: string, gallery: LockedGalleryState): void {
    this.galleries.set(gallery.galleryId, {
      ...gallery,
      workspaceId,
      passwordVersion: 1,
      passwordHash: "hash(mawar-4821)",
      passwordChangedBy: null,
      archivedBy: null,
      deleted: false,
    });
  }

  private lifecycle(gallery: FakeGallery) {
    const active = () =>
      this.sources.filter((row) => row.galleryId === gallery.galleryId && !row.removed);
    const set = (change: Partial<FakeGallery>) => {
      this.galleries.set(gallery.galleryId, {
        ...(this.galleries.get(gallery.galleryId) ?? gallery),
        ...change,
      });
    };
    return {
      countActiveSources: async () => active().length,
      countSourcePicks: async (sourceId: string) => (this.pickedSources.has(sourceId) ? 1 : 0),
      deleteSource: async (sourceId: string) => {
        const index = this.sources.findIndex(
          (row) => row.id === sourceId && row.galleryId === gallery.galleryId && !row.removed,
        );
        if (index < 0) return false;
        this.sources.splice(index, 1);
        const kept = this.photos.filter((photo) => photo.sourceId !== sourceId);
        this.photos.splice(0, this.photos.length, ...kept);
        return true;
      },
      renameSource: async (sourceId: string, label: string | null) => {
        const source = active().find((row) => row.id === sourceId);
        if (source) source.label = label;
        return source !== undefined;
      },
      publish: async (expiry: { expiresAt: Date | null; expiryDays: number | null }) => {
        set({ status: "PUBLISHED", ...expiry });
      },
      setExpiry: async (expiry: { expiresAt: Date | null; expiryDays: number | null }) => {
        set(expiry);
      },
      rotatePassword: async (rotated: { passwordHash: string }, actorId: string) => {
        set({
          passwordHash: rotated.passwordHash,
          passwordVersion: gallery.passwordVersion + 1,
          passwordChangedBy: actorId,
        });
      },
      archive: async (actorId: string) => {
        set({ status: "ARCHIVED", archivedBy: actorId });
      },
      deleteGallery: async () => {
        set({ deleted: true });
      },
      createSelectionGroups: async () => {
        this.selectionGroupCalls += 1;
        return 0;
      },
      // F-10 final delivery is tested against Postgres; the fake never publishes it.
      countFinishedFiles: async () => 0,
      publishFinalDelivery: async () => undefined,
    };
  }

  readonly galleryByProject = new Map<string, string>();
  selectionGroupCalls = 0;

  async findGalleryIdByProject(context: WorkspaceContext, projectId: string) {
    const id = this.galleryByProject.get(projectId) ?? null;
    return id !== null && this.galleries.get(id)?.workspaceId === context.workspaceId ? id : null;
  }

  async listActiveSources(context: WorkspaceContext, galleryId: string) {
    return this.sources
      .filter(
        (row) =>
          row.galleryId === galleryId && row.workspaceId === context.workspaceId && !row.removed,
      )
      .map((row) => ({ sourceId: row.id, name: row.folderName, folder: row.folder }));
  }

  async withLockedGallery<T>(
    context: WorkspaceContext,
    galleryId: string,
    work: Parameters<GallerySourceRepositoryPort["withLockedGallery"]>[2],
  ): Promise<T | "NOT_FOUND"> {
    const gallery = this.galleries.get(galleryId);
    if (!gallery || gallery.deleted || gallery.workspaceId !== context.workspaceId)
      return "NOT_FOUND";
    const writer = {
      ...this.lifecycle(gallery),
      isWorkspaceSourceActive: async (id: string) => this.activeWorkspaceSources.has(id),
      insertSource: async (source: NewGallerySource) => {
        const taken = this.sources.some(
          (row) =>
            row.galleryId === galleryId &&
            !row.removed &&
            row.folder.folderId === source.folder.folderId,
        );
        if (taken) return "FOLDER_ALREADY_LINKED" as const;
        this.next += 1;
        const id = `source-${String(this.next)}`;
        this.sources.push({
          ...source,
          id,
          workspaceId: context.workspaceId,
          galleryId,
          removed: false,
          syncStatus: "NEVER",
          syncErrorCode: null,
          startedAt: null,
          leaseAt: null,
          cursor: null,
          folderName: null,
        });
        return { sourceId: id };
      },
      replaceFolderMappings: async (sourceId: string, entries: readonly FolderMapEntry[]) => {
        this.savedMappings.set(sourceId, entries);
      },
      reclassifySource: async (sourceId: string, mappings: readonly FolderMapping[]) => {
        this.mappings.set(sourceId, [...mappings]);
        for (const [index, photo] of this.photos.entries()) {
          if (photo.sourceId !== sourceId) continue;
          const segments = photo.folderPath === "" ? [] : photo.folderPath.split("/");
          this.photos[index] = { ...photo, ...classifyPhoto(segments, mappings) };
        }
      },
    };
    return (await work(gallery, writer)) as T;
  }

  async findFolderMapping(context: WorkspaceContext, sourceId: string) {
    const source = this.source(context, sourceId);
    if (!source || source.removed) return null;
    const folders = [
      ...new Set(
        this.photos
          .filter(
            (photo) => photo.sourceId === sourceId && !photo.missing && photo.folderPath !== "",
          )
          .map((photo) => photo.folderPath),
      ),
    ].sort((a, b) => a.localeCompare(b));
    return {
      galleryId: source.galleryId,
      folders,
      items: this.mappableItems,
      mappings: this.savedMappings.get(sourceId) ?? [],
    };
  }

  async findFolderUse(_context: WorkspaceContext, _galleryId: string | null, folderId: string) {
    return this.otherProjectFolders.get(folderId) ?? [];
  }

  source(context: WorkspaceContext, sourceId: string): FakeSource | undefined {
    return this.sources.find(
      (row) => row.id === sourceId && row.workspaceId === context.workspaceId,
    );
  }

  async findSyncTarget(context: WorkspaceContext, sourceId: string) {
    const source = this.source(context, sourceId);
    const gallery = source ? this.galleries.get(source.galleryId) : undefined;
    if (!source || !gallery) return null;
    return {
      sourceId,
      galleryId: source.galleryId,
      folder: source.folder,
      removed: source.removed,
      runOpen: source.syncStatus === "SYNCING",
      gallery,
      mappings: this.mappings.get(sourceId) ?? this.defaultMappings,
    };
  }

  async takeNewFolders(_context: WorkspaceContext, sourceId: string) {
    const paths = [
      ...new Set(
        this.photos
          .filter(
            (photo) => photo.sourceId === sourceId && !photo.missing && photo.folderPath !== "",
          )
          .map((photo) => photo.folderPath),
      ),
    ].sort((a, b) => a.localeCompare(b));
    const known = this.knownFolders.get(sourceId) ?? [];
    this.knownFolders.set(sourceId, paths);
    return paths.filter((path) => !known.includes(path));
  }

  async claimStep(
    context: WorkspaceContext,
    sourceId: string,
    now: Date,
  ): Promise<SyncClaim | null> {
    const source = this.source(context, sourceId);
    if (!source || source.removed) return null;
    const leaseHeld =
      source.leaseAt !== null && now.getTime() - source.leaseAt.getTime() < LEASE_MS;
    if (source.syncStatus === "SYNCING" && leaseHeld) return null;
    if (source.syncStatus !== "SYNCING") {
      Object.assign(source, { syncStatus: "SYNCING", startedAt: now, cursor: null });
    }
    source.leaseAt = now;
    return { sourceId, startedAt: source.startedAt ?? now, leaseAt: now, cursor: source.cursor };
  }

  private writePhotos(sourceId: string, photos: readonly SyncedPhoto[]) {
    for (const photo of photos) {
      const existing = this.photos.find(
        (row) => row.sourceId === sourceId && row.externalFileId === photo.externalFileId,
      );
      if (!existing) {
        this.photos.push({ ...photo, sourceId, missing: false });
        this.photoWrites += 1;
      } else if (changed(existing, photo)) {
        Object.assign(existing, photo, { missing: false });
        this.photoWrites += 1;
      }
    }
  }

  async commitStep(context: WorkspaceContext, claim: SyncClaim, step: SyncStepResult) {
    const source = this.source(context, claim.sourceId);
    if (!source || source.removed || source.leaseAt?.getTime() !== claim.leaseAt.getTime()) {
      return false;
    }
    this.writePhotos(source.id, step.photos);
    if (!step.done) {
      Object.assign(source, { cursor: step.cursor, leaseAt: null });
      return true;
    }
    const seen = new Set(step.cursor.seen);
    for (const photo of this.photos.filter((row) => row.sourceId === source.id)) {
      if (!seen.has(photo.externalFileId)) photo.missing = true;
    }
    Object.assign(source, {
      syncStatus: "SUCCEEDED",
      syncErrorCode: null,
      folderName: step.cursor.folderName,
      cursor: null,
      leaseAt: null,
    });
    return true;
  }

  async failRun(context: WorkspaceContext, _claim: SyncClaim, code: SyncFailureCode) {
    const source = this.source(context, _claim.sourceId);
    if (source) {
      Object.assign(source, {
        syncStatus: "FAILED",
        syncErrorCode: code,
        cursor: null,
        leaseAt: null,
      });
    }
  }
}

const LEASE_MS = 2 * 60 * 1000;

function changed(existing: FakePhoto, photo: SyncedPhoto): boolean {
  return (
    existing.missing ||
    existing.fileName !== photo.fileName ||
    existing.kind !== photo.kind ||
    existing.folderPath !== photo.folderPath ||
    existing.browsePath !== photo.browsePath
  );
}
/* eslint-enable @typescript-eslint/require-await -- end of the fake */
