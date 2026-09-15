import { CreativeJobSchema } from "@/lib/contracts";
import { planJob } from "@/lib/pipeline";

export async function GET() {
  const job = CreativeJobSchema.parse({
    id: "demo-thursday-shoot",
    sourceType: "video",
    sourceLabel: "Thursday shoot — demo",
    createdAt: new Date().toISOString(),
    status: "intake",
    units: [
      {
        id: "unit-ask-frew-01",
        sourceId: "clip-01",
        channel: "instagram_reel",
        angle: "patient-search intent",
        hook: "Ask Dr. Frew",
        body: "Structured demo content unit. No publishing is performed.",
        cta: "Save this for your consult questions.",
        assetIds: [],
        riskFlags: ["medical_claim"],
        reviewStatus: "required",
        derivativeStatus: "pending",
        publishStatus: "blocked"
      }
    ]
  });

  return Response.json({ ok: true, job, plan: planJob(job) });
}
