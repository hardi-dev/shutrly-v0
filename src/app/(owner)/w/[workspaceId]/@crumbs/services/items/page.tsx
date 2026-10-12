import StaticCrumbs from "../../[...segments]/page";

// Mirror: without it the dynamic slot `services/[serviceId]` would capture `items`.
export default async function ServiceItemsCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  return (
    <StaticCrumbs params={Promise.resolve({ workspaceId, segments: ["services", "items"] })} />
  );
}
