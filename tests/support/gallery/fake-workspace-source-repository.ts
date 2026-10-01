/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  NewWorkspaceSource,
  WorkspaceSourceRecord,
  WorkspaceSourceRepositoryPort,
} from "@/features/gallery/application/ports/workspace-source-repository/workspace-source-repository.port";
import { sourceNameKey } from "@/features/gallery/domain/source-name/source-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredSource extends WorkspaceSourceRecord {
  readonly workspaceId: string;
  readonly configData: Readonly<Record<string, never>>;
  readonly updatedBy: string | null;
}

export class FakeWorkspaceSourceRepository implements WorkspaceSourceRepositoryPort {
  readonly rows: StoredSource[] = [];
  readonly inUse = new Set<string>();

  async listForWorkspace(context: WorkspaceContext): Promise<readonly WorkspaceSourceRecord[]> {
    return this.rows.filter((row) => row.workspaceId === context.workspaceId);
  }

  async create(context: WorkspaceContext, source: NewWorkspaceSource) {
    if (
      this.rows.some(
        (row) =>
          row.workspaceId === context.workspaceId &&
          sourceNameKey(row.displayName) === sourceNameKey(source.displayName),
      )
    ) {
      return "NAME_TAKEN" as const;
    }
    this.rows.push({
      id: crypto.randomUUID(),
      workspaceId: context.workspaceId,
      provider: source.provider,
      displayName: source.displayName,
      isActive: true,
      configData: {},
      updatedBy: source.editorUserId,
    });
    return "CREATED" as const;
  }

  async rename(
    context: WorkspaceContext,
    change: { readonly id: string; readonly displayName: string; readonly editorUserId: string },
  ) {
    const row = this.rows.find(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === change.id,
    );
    if (!row) return "NOT_FOUND" as const;
    if (
      this.rows.some(
        (candidate) =>
          candidate.workspaceId === context.workspaceId &&
          candidate.id !== change.id &&
          sourceNameKey(candidate.displayName) === sourceNameKey(change.displayName),
      )
    ) {
      return "NAME_TAKEN" as const;
    }
    const index = this.rows.indexOf(row);
    this.rows[index] = { ...row, displayName: change.displayName, updatedBy: change.editorUserId };
    return "UPDATED" as const;
  }

  async setActive(
    context: WorkspaceContext,
    change: { readonly id: string; readonly isActive: boolean; readonly editorUserId: string },
  ) {
    const index = this.rows.findIndex(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === change.id,
    );
    if (index === -1) return false;
    const row = this.rows[index];
    this.rows[index] = { ...row, isActive: change.isActive, updatedBy: change.editorUserId };
    return true;
  }

  async delete(context: WorkspaceContext, id: string) {
    const index = this.rows.findIndex(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === id,
    );
    if (index === -1) return "NOT_FOUND" as const;
    if (this.inUse.has(id)) return "IN_USE" as const;
    this.rows.splice(index, 1);
    return "DELETED" as const;
  }

  async seedDefault(context: WorkspaceContext, source: NewWorkspaceSource) {
    if (this.rows.some((row) => row.workspaceId === context.workspaceId)) return;
    await this.create(context, source);
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
