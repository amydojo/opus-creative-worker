import { z } from "zod";
import { OpusDeliverableSchema } from "@/lib/ai/opus-package";
import { saveDeliverableToNotion } from "@/lib/notion/save-deliverable";

const SaveRequestSchema = z.object({
  deliverable: OpusDeliverableSchema,
  mode: z.enum(["draft", "review"]).default("draft"),
});

export async function POST(request: Request) {
  try {
    const input = SaveRequestSchema.parse(await request.json());
    const result = await saveDeliverableToNotion(input.deliverable, input.mode);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, error: error.issues[0]?.message ?? "Invalid save request." },
        { status: 400 },
      );
    }

    console.error("OPUS Notion save failed", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to save to Notion.",
      },
      { status: 500 },
    );
  }
}
