import "server-only";

import type { DefinitionType } from "@/features/booking/domain/item-definition-type/item-definition-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ActiveChange } from "../category-repository/category-repository.port";

export interface ItemDefinitionRecord extends DefinitionType {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly isActive: boolean;
  readonly usageCount: number;
}

export interface ItemDefinitionInput extends DefinitionType {
  readonly name: string;
  readonly unit: string | null;
  readonly editorUserId: string | null;
}

export interface ItemDefinitionRepositoryPort {
  readonly list: (context: WorkspaceContext) => Promise<readonly ItemDefinitionRecord[]>;
  readonly findById: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<ItemDefinitionRecord | null>;
  readonly create: (
    context: WorkspaceContext,
    input: ItemDefinitionInput,
  ) => Promise<"CREATED" | "NAME_TAKEN">;
  /** Changes the type only while no service item uses the definition (BR-CAT-010), in one statement. */
  readonly update: (
    context: WorkspaceContext,
    id: string,
    input: ItemDefinitionInput,
  ) => Promise<"UPDATED" | "NAME_TAKEN" | "LOCKED" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  /** Inserts each default whose name the workspace doesn't have yet (BR-CAT-011). */
  readonly seedDefaults: (
    context: WorkspaceContext,
    defaults: readonly ItemDefinitionInput[],
  ) => Promise<void>;
}
