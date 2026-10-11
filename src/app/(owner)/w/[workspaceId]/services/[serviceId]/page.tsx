import { getTranslations } from "next-intl/server";

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

import { SERVICE_DETAIL_PAGE_COPY_NAMESPACE } from "./page.copy";

export default async function ServiceDetailPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const service = await loadServiceDetail(workspaceId, serviceId);
  const categories = await loadCategories(workspaceId);
  const definitions = await loadItemDefinitions(workspaceId);
  const t = await getTranslations(SERVICE_DETAIL_PAGE_COPY_NAMESPACE);
  return (
    <>
      <PageHeadingOverride
        title={service.name}
        subtitle={t("serviceDetailSubtitle")}
        parent={{ label: t("tabServices"), href: `/w/${workspaceId}/services` }}
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
