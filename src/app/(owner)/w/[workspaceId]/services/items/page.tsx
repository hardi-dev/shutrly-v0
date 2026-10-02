import {
  addItemDefinitionAction,
  deleteCatalogEntryAction,
  setCatalogActiveAction,
  updateItemDefinitionAction,
} from "@/app/actions/booking/catalog";
import { loadItemDefinitions } from "@/composition/booking/catalog-flow/catalog-flow";
import { ItemDefinitionsScreen } from "@/features/booking/ui/item-definitions-screen/item-definitions-screen";

export default async function ItemsPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const definitions = await loadItemDefinitions(workspaceId);
  return (
    <ItemDefinitionsScreen
      workspaceId={workspaceId}
      definitions={definitions}
      addAction={addItemDefinitionAction}
      updateAction={updateItemDefinitionAction}
      setActiveAction={setCatalogActiveAction}
      removeAction={deleteCatalogEntryAction}
    />
  );
}
