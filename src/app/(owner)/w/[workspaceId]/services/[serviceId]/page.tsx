import { loadServiceDetail } from "@/composition/booking/catalog-flow/catalog-flow";
import { ServiceDetailScreen } from "@/features/booking/ui/service-detail-screen/service-detail-screen";
import { PageHeadingOverride } from "@/features/workspace/ui/page-heading-override/page-heading-override";

export default async function ServiceDetailPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string; serviceId: string }> }>) {
  const { workspaceId, serviceId } = await params;
  const service = await loadServiceDetail(workspaceId, serviceId);
  return (
    <>
      <PageHeadingOverride
        title={service.name}
        parent={{ label: "Layanan", href: `/w/${workspaceId}/services` }}
      />
      <ServiceDetailScreen service={service} />
    </>
  );
}
