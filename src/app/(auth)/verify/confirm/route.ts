import { verifyEmailLinkResponse } from "@/composition/auth/verify-flow/verify-flow";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return verifyEmailLinkResponse(request);
}
