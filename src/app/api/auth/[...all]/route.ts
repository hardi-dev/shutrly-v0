import { handleAuthRequest } from "@/composition/auth/auth-api/auth-api";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}

export function POST(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}
