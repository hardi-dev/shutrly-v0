import StaticCrumbs from "../../[...segments]/page";

// Mirror: without it the dynamic slot `services/[serviceId]` would capture `categories`.
export default async function ServiceCategoriesCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  return (
    <StaticCrumbs params={Promise.resolve({ workspaceId, segments: ["services", "categories"] })} />
  );
}
