import { capturedLinksResponse } from "@/composition/auth/email-capture/email-capture";

export const dynamic = "force-dynamic";

// E2E only: 404 unless E2E_EMAIL_CAPTURE=1 on a localhost BETTER_AUTH_URL.
export function GET(request: Request): Promise<Response> {
  return capturedLinksResponse(request);
}
