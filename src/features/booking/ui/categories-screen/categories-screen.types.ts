import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";

export interface CategoriesScreenProps {
  readonly workspaceId: string;
  readonly categories: readonly CategoryRecord[];
}
