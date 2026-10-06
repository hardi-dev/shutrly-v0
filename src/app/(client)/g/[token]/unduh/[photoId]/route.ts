import { serveClientFileEntry } from "@/composition/gallery/client-gallery-flow/client-gallery-flow";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/g/[token]/unduh/[photoId]">,
): Promise<Response> {
  const { token, photoId } = await params;
  return serveClientFileEntry(token, photoId);
}
