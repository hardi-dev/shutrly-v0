import {
  addBookingFieldAction,
  addServiceItemAction,
  moveBookingFieldAction,
  moveServiceItemAction,
  removeBookingFieldAction,
  removeServiceItemAction,
  setCatalogActiveAction,
  updateBookingFieldAction,
  updateServiceInfoAction,
  updateServiceItemAction,
} from "@/app/actions/booking/catalog";
import {
  loadCategories,
  loadItemDefinitions,
  loadServiceDetail,
} from "@/composition/booking/catalog-flow/catalog-flow";
import { ServiceDetailScreen } from "@/features/booking/ui/service-detail-screen/service-detail-screen";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function ServiceDetailPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const service = await loadServiceDetail(workspaceId, serviceId);
  const categories = await loadCategories(workspaceId);
  const definitions = await loadItemDefinitions(workspaceId);
  return (
    <>
      <PageHeadingOverride
        title={service.name}
        parent={{ label: "Layanan", href: `/w/${workspaceId}/services` }}
      />
      <ServiceDetailScreen
        service={service}
        workspaceId={workspaceId}
        setActiveAction={setCatalogActiveAction}
        categories={categories}
        updateServiceInfoAction={updateServiceInfoAction}
        definitions={[...definitions.selection, ...definitions.other]}
        addItemAction={addServiceItemAction}
        updateItemAction={updateServiceItemAction}
        removeItemAction={removeServiceItemAction}
        moveItemAction={moveServiceItemAction}
        addFieldAction={addBookingFieldAction}
        updateFieldAction={updateBookingFieldAction}
        removeFieldAction={removeBookingFieldAction}
        moveFieldAction={moveBookingFieldAction}
      />
    </>
  );
}
