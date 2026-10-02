import { loadServices } from "@/composition/booking/catalog-flow/catalog-flow";
import { ServicesScreen } from "@/features/booking/ui/services-screen/services-screen";

export default async function ServicesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const groups = await loadServices(workspaceId);
  return <ServicesScreen workspaceId={workspaceId} groups={groups} />;
}
