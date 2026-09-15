import { ContentUnit, CreativeJob, RiskFlagSchema } from "./contracts";

export type PipelineStage =
  | "intake"
  | "media"
  | "content"
  | "canva"
  | "qa"
  | "review"
  | "derivatives"
  | "ready";

export type StageState = "pending" | "active" | "blocked" | "done";

export interface PipelineStep {
  stage: PipelineStage;
  state: StageState;
  reason: string;
}

const approvalFlags = new Set<string>(RiskFlagSchema.options);

export function requiresHumanApproval(unit: ContentUnit): boolean {
  return unit.riskFlags.some((flag) => approvalFlags.has(flag));
}

export function planJob(job: CreativeJob): PipelineStep[] {
  const needsReview = job.units.some(requiresHumanApproval);
  const hasUnits = job.units.length > 0;

  return [
    { stage: "intake", state: "done", reason: "Source is registered." },
    { stage: "media", state: "active", reason: "Normalize and inspect source assets." },
    {
      stage: "content",
      state: hasUnits ? "done" : "pending",
      reason: hasUnits ? "Structured content units exist." : "Awaiting content extraction.",
    },
    { stage: "canva", state: "pending", reason: "Compile approved master only after content is ready." },
    { stage: "qa", state: "pending", reason: "Run brand, privacy, claim, and channel checks." },
    {
      stage: "review",
      state: needsReview ? "blocked" : "pending",
      reason: needsReview
        ? "Human approval required for risk-sensitive content."
        : "No consequential risk flags detected.",
    },
    { stage: "derivatives", state: "pending", reason: "Generate channel variants after approval." },
    { stage: "ready", state: "pending", reason: "Publishing package is not ready yet." },
  ];
}
