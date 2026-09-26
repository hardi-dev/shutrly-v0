import "server-only";

import {
  capturedLinks,
  isEmailCaptureEnabled,
} from "@/adapters/email/capturing-email-sender/capturing-email-sender";

import { getRequestContext } from "../../request-context/request-context";

/**
 * E2E only: the links captured for `?to=`, or 404 unless capture is on for localhost.
 * @param request - the Playwright request
 * @returns the captured links as JSON, never cached
 */
export async function capturedLinksResponse(request: Request): Promise<Response> {
  const { env } = await getRequestContext();
  if (!isEmailCaptureEnabled(env)) return new Response(null, { status: 404 });
  const to = new URL(request.url).searchParams.get("to") ?? "";
  return Response.json(capturedLinks(to), { headers: { "Cache-Control": "no-store" } });
}
