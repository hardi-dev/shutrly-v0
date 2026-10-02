import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  CategoryRecord,
  CategoryRepositoryPort,
} from "../../ports/category-repository/category-repository.port";

export async function listCategories(
  repository: CategoryRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly CategoryRecord[]> {
  const categories = await repository.list(context);
  return [...categories].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name, "id", { sensitivity: "base" });
  });
}
