import { z } from "zod";
import { RiskFlagSchema } from "../contracts";

export const OpusJobSchema = z.enum([
  "Magnet",
  "Trust",
  "Intent",
  "Story Support",
]);

export const OpusFunnelSchema = z.enum([
  "Discover",
  "Consider",
  "Convert",
]);

export const OpusSourceLaneSchema = z.enum([
  "Frew",
  "Procedure",
  "Proof",
  "OPUS World",
  "Education",
  "People",
  "Local",
  "Conversion",
]);

export const OpusFormatSchema = z.enum([
  "Reel",
  "Story",
  "Carousel",
  "Still",
  "Short",
  "Long-form",
  "Before / After",
  "Ad Creative",
  "Other",
]);

export const OpusChannelSchema = z.enum([
  "Instagram",
  "Facebook",
  "Google Business Profile",
  "TikTok",
  "YouTube",
  "Website",
  "Meta Ads",
  "Google Ads",
  "Email / SMS",
]);

export const OpusPrimaryKpiSchema = z.enum([
  "Hook rate",
  "Watch time",
  "Shares",
  "Saves",
  "Comments",
  "Profile visits",
  "CTR",
  "Leads",
  "Consults",
]);

export const OpusTestVariableSchema = z.enum([
  "Hook",
  "Visual",
  "Angle",
  "CTA",
  "Length",
  "Format",
]);

export const OpusQualityGateSchema = z.object({
  utility: z.boolean(),
  novelty: z.boolean(),
  desire: z.boolean(),
  humanity: z.boolean(),
  proof: z.boolean(),
  score: z.number().int().min(0).max(5),
});

export const OpusDeliverableSchema = z.object({
  deliverable: z.string().min(1),
  job: OpusJobSchema,
  funnel: OpusFunnelSchema,
  sourceLane: OpusSourceLaneSchema,
  format: OpusFormatSchema,
  channels: z.array(OpusChannelSchema).min(1),
  campaign: z.string(),
  hook: z.string().min(1),
  oneMessage: z.string().min(1),
  proof: z.string(),
  cta: z.string(),
  primaryKpi: OpusPrimaryKpiSchema,
  testVariable: OpusTestVariableSchema,
  editorialPremise: z.string().min(1),
  whyThisMatters: z.string().min(1),
  copy: z.object({
    onScreenTitle: z.string().min(1),
    caption: z.string(),
    storyFrames: z.array(z.string()).max(6).default([]),
  }),
  qualityGate: OpusQualityGateSchema,
  riskFlags: z.array(RiskFlagSchema).default([]),
  nextStep: z.string().min(1),
});

export const OpusPackageSchema = z.object({
  sourceSummary: z.string(),
  editorialPremise: z.string(),
  primary: OpusDeliverableSchema,
  derivatives: z.array(OpusDeliverableSchema).max(8),
  packageWarnings: z.array(z.string()).default([]),
});

export type OpusDeliverable = z.infer<typeof OpusDeliverableSchema>;
export type OpusPackage = z.infer<typeof OpusPackageSchema>;
