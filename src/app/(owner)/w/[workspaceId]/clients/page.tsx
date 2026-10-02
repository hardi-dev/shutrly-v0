import {
  addClientAction,
  deleteClientAction,
  setClientArchivedAction,
  updateClientAction,
} from "@/app/actions/booking/clients";
import { loadClients } from "@/composition/booking/client-flow/client-flow";
import { ClientsScreen } from "@/features/booking/ui/clients-screen/clients-screen";

export default async function ClientsPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ workspaceId: string }>; searchParams: Promise<{ q?: string }> }>) {
  const { workspaceId } = await params;
  const { q } = await searchParams;
  const data = await loadClients(workspaceId, "ACTIVE", q);
  return (
    <ClientsScreen
      workspaceId={workspaceId}
      status={data.status}
      count={data.count}
      rows={data.page.items}
      addAction={addClientAction}
      updateAction={updateClientAction}
      setArchivedAction={setClientArchivedAction}
      deleteAction={deleteClientAction}
    />
  );
}
