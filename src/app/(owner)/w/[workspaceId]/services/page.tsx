import {
  addCategoryAction,
  addServiceAction,
  deleteCatalogEntryAction,
  setCatalogActiveAction,
  updateServiceInfoAction,
} from "@/app/actions/booking/catalog";
import { loadServices } from "@/composition/booking/catalog-flow/catalog-flow";
import { loadCategories } from "@/composition/booking/catalog-flow/catalog-flow";
import { ServicesScreen } from "@/features/booking/ui/services-screen/services-screen";

export default async function ServicesPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ add?: string }>;
}>) {
  const { workspaceId } = await params;
  const { add } = await searchParams;
  const groups = await loadServices(workspaceId);
  const categories = await loadCategories(workspaceId);
  return (
    <ServicesScreen
      workspaceId={workspaceId}
      groups={groups}
      categories={categories}
      openAddOnLoad={add === "service"}
      addServiceAction={addServiceAction}
      addCategoryAction={addCategoryAction}
      updateServiceInfoAction={updateServiceInfoAction}
      setActiveAction={setCatalogActiveAction}
      removeAction={deleteCatalogEntryAction}
    />
  );
}
