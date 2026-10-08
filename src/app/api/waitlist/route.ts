import { submitWaitlist } from "@/composition/landing/submit-waitlist/submit-waitlist";

export const dynamic = "force-dynamic";

// Public and rate-limited at the edge (netlify.toml, ADR-022). Answers only the outcome, never
// the email, and is never cached (AC-LND-012).
export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const result = await submitWaitlist(body);
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
