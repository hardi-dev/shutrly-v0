/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  CategoryRecord,
  CategoryRepositoryPort,
} from "@/features/booking/application/ports/category-repository/category-repository.port";
import { catalogNameKey } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredCategory extends CategoryRecord {
  readonly workspaceId: string;
  readonly updatedBy: string;
}

export class FakeCategoryRepository implements CategoryRepositoryPort {
  readonly rows: StoredCategory[] = [];
  readonly servicesByCategory = new Map<string, { active: number; archived: number }>();

  async list(context: WorkspaceContext): Promise<readonly CategoryRecord[]> {
    return this.rows
      .filter((row) => row.workspaceId === context.workspaceId)
      .map((row) => {
        const counts = this.servicesByCategory.get(row.id) ?? { active: 0, archived: 0 };
        return { ...row, serviceCount: counts.active, archivedServiceCount: counts.archived };
      });
  }

  async create(context: WorkspaceContext, name: string, editorUserId: string) {
    if (
      this.rows.some(
        (row) =>
          row.workspaceId === context.workspaceId &&
          catalogNameKey(row.name) === catalogNameKey(name),
      )
    ) {
      return { status: "NAME_TAKEN" } as const;
    }
    const id = crypto.randomUUID();
    this.rows.push({
      id,
      workspaceId: context.workspaceId,
      name,
      isActive: true,
      serviceCount: 0,
      archivedServiceCount: 0,
      updatedBy: editorUserId,
    });
    return { status: "CREATED", id } as const;
  }

  async rename(
    context: WorkspaceContext,
    change: { id: string; name: string; editorUserId: string },
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
          catalogNameKey(candidate.name) === catalogNameKey(change.name),
      )
    ) {
      return "NAME_TAKEN" as const;
    }
    const index = this.rows.indexOf(row);
    this.rows[index] = { ...row, name: change.name, updatedBy: change.editorUserId };
    return "UPDATED" as const;
  }

  async setActive(
    context: WorkspaceContext,
    change: { id: string; isActive: boolean; editorUserId: string },
  ) {
    const index = this.rows.findIndex(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === change.id,
    );
    if (index === -1) return false;
    this.rows[index] = {
      ...this.rows[index],
      isActive: change.isActive,
      updatedBy: change.editorUserId,
    };
    return true;
  }

  async delete(context: WorkspaceContext, id: string) {
    const index = this.rows.findIndex(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === id,
    );
    if (index === -1) return "NOT_FOUND" as const;
    const counts = this.servicesByCategory.get(id);
    if ((counts?.active ?? 0) + (counts?.archived ?? 0) > 0) return "IN_USE" as const;
    this.rows.splice(index, 1);
    return "DELETED" as const;
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
