/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  ItemDefinitionInput,
  ItemDefinitionRecord,
  ItemDefinitionRepositoryPort,
} from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { catalogNameKey } from "@/features/booking/domain/catalog-name/catalog-name";
import { isTypeChange } from "@/features/booking/domain/item-definition-type/item-definition-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredDefinition extends ItemDefinitionRecord {
  readonly workspaceId: string;
  readonly updatedBy: string | null;
}

export class FakeItemDefinitionRepository implements ItemDefinitionRepositoryPort {
  readonly rows: StoredDefinition[] = [];
  readonly usage = new Map<string, number>();

  async list(context: WorkspaceContext): Promise<readonly ItemDefinitionRecord[]> {
    return this.rows
      .filter((row) => row.workspaceId === context.workspaceId)
      .map((row) => ({ ...row, usageCount: this.usage.get(row.id) ?? 0 }));
  }

  async findById(context: WorkspaceContext, id: string): Promise<ItemDefinitionRecord | null> {
    const row = this.rows.find(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === id,
    );
    return row ? { ...row, usageCount: this.usage.get(row.id) ?? 0 } : null;
  }

  async create(context: WorkspaceContext, input: ItemDefinitionInput) {
    if (this.hasName(context.workspaceId, input.name)) return "NAME_TAKEN" as const;
    const id = crypto.randomUUID();
    this.rows.push({
      ...input,
      id,
      workspaceId: context.workspaceId,
      isActive: true,
      usageCount: 0,
      updatedBy: input.editorUserId,
    });
    return "CREATED" as const;
  }

  async update(context: WorkspaceContext, id: string, input: ItemDefinitionInput) {
    const row = this.rows.find(
      (candidate) => candidate.workspaceId === context.workspaceId && candidate.id === id,
    );
    if (!row) return "NOT_FOUND" as const;
    if (this.hasName(context.workspaceId, input.name, id)) return "NAME_TAKEN" as const;
    if (isTypeChange(row, input) && (this.usage.get(id) ?? 0) > 0) return "LOCKED" as const;
    const index = this.rows.indexOf(row);
    this.rows[index] = {
      ...row,
      ...input,
      updatedBy: input.editorUserId,
      usageCount: this.usage.get(id) ?? 0,
    };
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
    if ((this.usage.get(id) ?? 0) > 0) return "IN_USE" as const;
    this.rows.splice(index, 1);
    this.usage.delete(id);
    return "DELETED" as const;
  }

  async seedDefaults(context: WorkspaceContext, defaults: readonly ItemDefinitionInput[]) {
    for (const input of defaults) {
      if (!this.hasName(context.workspaceId, input.name)) await this.create(context, input);
    }
  }

  private hasName(workspaceId: string, name: string, ignoredId?: string): boolean {
    return this.rows.some(
      (row) =>
        row.workspaceId === workspaceId &&
        row.id !== ignoredId &&
        catalogNameKey(row.name) === catalogNameKey(name),
    );
  }
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
