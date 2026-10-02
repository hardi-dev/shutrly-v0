import {
  addCategoryAction,
  deleteCatalogEntryAction,
  renameCategoryAction,
  setCatalogActiveAction,
} from "@/app/actions/booking/catalog";
import { loadCategories } from "@/composition/booking/catalog-flow/catalog-flow";
import { CategoriesScreen } from "@/features/booking/ui/categories-screen/categories-screen";

export default async function CategoriesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const categories = await loadCategories(workspaceId);
  return (
    <CategoriesScreen
      workspaceId={workspaceId}
      categories={categories}
      addAction={addCategoryAction}
      renameAction={renameCategoryAction}
      setActiveAction={setCatalogActiveAction}
      removeAction={deleteCatalogEntryAction}
    />
  );
}
