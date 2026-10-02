import { loadClients } from "@/composition/booking/client-flow/client-flow";
import { ClientsScreen } from "@/features/booking/ui/clients-screen/clients-screen";

export default async function ArchivedClientsPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ workspaceId: string }>; searchParams: Promise<{ q?: string }> }>) {
  const { workspaceId } = await params;
  const { q } = await searchParams;
  const data = await loadClients(workspaceId, "ARCHIVED", q);
  return (
    <ClientsScreen
      workspaceId={workspaceId}
      status={data.status}
      count={data.count}
      rows={data.page.items}
    />
  );
}
