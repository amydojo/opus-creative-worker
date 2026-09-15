import { NextRequest } from "next/server";
import { CreativeJobSchema } from "@/lib/contracts";
import { planJob } from "@/lib/pipeline";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreativeJobSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "invalid_job", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return Response.json({ ok: true, plan: planJob(parsed.data) });
}
