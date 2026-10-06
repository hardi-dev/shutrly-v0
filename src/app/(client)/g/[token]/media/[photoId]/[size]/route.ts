import { serveClientPhotoEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/g/[token]/media/[photoId]/[size]">,
): Promise<Response> {
  const { token, photoId, size } = await params;
  return serveClientPhotoEntry(token, photoId, size);
}
