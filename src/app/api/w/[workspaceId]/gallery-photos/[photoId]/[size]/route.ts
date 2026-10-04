import { serveOwnerPhotoEntry } from "@/composition/gallery/gallery-media/gallery-media";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/w/[workspaceId]/gallery-photos/[photoId]/[size]">,
): Promise<Response> {
  const { workspaceId, photoId, size } = await params;
  return serveOwnerPhotoEntry(workspaceId, photoId, size);
}
