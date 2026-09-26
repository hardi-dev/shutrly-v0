import { checkDatabase } from "@/composition/health/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  await checkDatabase();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
