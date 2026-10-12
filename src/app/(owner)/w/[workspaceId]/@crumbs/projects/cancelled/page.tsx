import StaticCrumbs from "../../[...segments]/page";

// Mirror: without it the dynamic slot `projects/[projectId]` would capture `cancelled`.
export default async function CancelledProjectsCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  return (
    <StaticCrumbs params={Promise.resolve({ workspaceId, segments: ["projects", "cancelled"] })} />
  );
}
