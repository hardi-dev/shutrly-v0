import { loadPhotoSources } from "@/composition/gallery/source-config-flow/source-config-flow";
import { PhotoSourcesScreen } from "@/features/gallery/ui/photo-sources-screen/photo-sources-screen";

export default async function PhotoSourcesPage({
  params,
}: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
  const { workspaceId } = await params;
  const { sources } = await loadPhotoSources(workspaceId);
  return <PhotoSourcesScreen workspaceId={workspaceId} sources={sources} />;
}
