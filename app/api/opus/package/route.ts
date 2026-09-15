import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { OPUS_SYSTEM_PROMPT } from "@/lib/ai/opus-prompt";
import { OpusPackageSchema } from "@/lib/ai/opus-package";

export const maxDuration = 60;

const RequestSchema = z.object({
  transcript: z.string().trim().min(20, "Transcript is too short to package reliably."),
  sourceLabel: z.string().trim().max(160).default(""),
  campaign: z.string().trim().max(160).default(""),
  objective: z.string().trim().max(500).default(""),
});

export async function POST(request: Request) {
  try {
    const input = RequestSchema.parse(await request.json());

    const result = await generateText({
      model: "openai/gpt-5.6-sol",
      system: OPUS_SYSTEM_PROMPT,
      output: Output.object({
        name: "OpusContentPackage",
        description: "A production-ready OPUS content package using only canonical OPUS pipeline vocabulary.",
        schema: OpusPackageSchema,
      }),
      prompt: `Package the following source material for OPUS Plastic Surgery.\n\nSOURCE LABEL:\n${input.sourceLabel || "Unlabeled source"}\n\nCAMPAIGN:\n${input.campaign || "Determine from context; do not invent a campaign if none is supported."}\n\nOBJECTIVE:\n${input.objective || "Choose the most strategically appropriate OPUS content job from the source."}\n\nRAW TRANSCRIPT:\n\"\"\"\n${input.transcript}\n\"\"\"\n\nInstructions:\n- Select ONE strongest primary deliverable.\n- Generate derivatives only when each has a real strategic reason to exist.\n- Preserve uncertainty and conditions from the source.\n- Never invent facts, outcomes, approvals, rights, patient information, credentials, availability, or claims.\n- Apply all relevant risk flags.\n- Quality-gate score must equal the number of true quality dimensions.\n- Return only schema-valid structured output.`,
    });

    return Response.json(result.output);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("OPUS package schema generation failed", error.cause);
      return Response.json(
        { error: "The model could not produce a valid OPUS package. Try a clearer or longer transcript." },
        { status: 422 },
      );
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid package request." },
        { status: 400 },
      );
    }

    console.error("OPUS package generation failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to generate OPUS package." },
      { status: 500 },
    );
  }
}
