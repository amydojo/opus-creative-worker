import { z } from "zod";

export const ChannelSchema = z.enum([
  "instagram_reel",
  "instagram_post",
  "instagram_story",
  "tiktok",
  "youtube",
  "youtube_short",
  "meta_ad",
  "patient_education",
]);

export const RiskFlagSchema = z.enum([
  "paid_spend",
  "patient_media",
  "before_after",
  "medical_claim",
  "testimonial",
  "privacy",
  "compliance_unknown",
]);

export const ContentUnitSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  channel: ChannelSchema,
  angle: z.string(),
  hook: z.string(),
  body: z.string(),
  cta: z.string().optional(),
  canvaMasterId: z.string().optional(),
  assetIds: z.array(z.string()).default([]),
  riskFlags: z.array(RiskFlagSchema).default([]),
  reviewStatus: z.enum(["not_required", "required", "approved", "changes_requested"]).default("required"),
  derivativeStatus: z.enum(["pending", "ready"]).default("pending"),
  publishStatus: z.enum(["blocked", "ready", "published"]).default("blocked"),
});

export type ContentUnit = z.infer<typeof ContentUnitSchema>;

export const CreativeJobSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["video", "image_set", "transcript", "brief"]),
  sourceLabel: z.string(),
  createdAt: z.string(),
  status: z.enum(["intake", "content", "canva", "qa", "review", "ready", "failed"]),
  units: z.array(ContentUnitSchema),
});

export type CreativeJob = z.infer<typeof CreativeJobSchema>;
