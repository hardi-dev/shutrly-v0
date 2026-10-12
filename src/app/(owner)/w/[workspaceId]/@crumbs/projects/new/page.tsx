import StaticCrumbs from "../../[...segments]/page";

// Mirror: without it the dynamic slot `projects/[projectId]` would capture `new`.
export default async function NewProjectCrumbs({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  return <StaticCrumbs params={Promise.resolve({ workspaceId, segments: ["projects", "new"] })} />;
}
