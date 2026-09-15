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

type PackageInput = z.infer<typeof RequestSchema>;

async function createPackage(input: PackageInput) {
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

  return result.output;
}

function errorResponse(error: unknown) {
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

export async function POST(request: Request) {
  try {
    const input = RequestSchema.parse(await request.json());
    return Response.json(await createPackage(input));
  } catch (error) {
    return errorResponse(error);
  }
}

// Temporary preview-only runtime smoke. Removed after validation.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (process.env.VERCEL_ENV !== "preview" || searchParams.get("smoke") !== "opus-v02") {
    return new Response("Not found", { status: 404 });
  }

  try {
    return Response.json(await createPackage({
      sourceLabel: "Runtime smoke · Frew POV",
      campaign: "",
      objective: "Build trust through surgeon judgment without inventing claims.",
      transcript: "I do not start with a procedure name. I start by looking at the skin, the tissue, the proportions, and what is actually bothering the patient. Sometimes the right answer is less surgery, not more. The plan depends on what I see in front of me.",
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
