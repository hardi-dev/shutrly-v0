import { continueAfterGoogleResponse } from "@/composition/auth/google-flow/google-flow";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return continueAfterGoogleResponse(request);
}
