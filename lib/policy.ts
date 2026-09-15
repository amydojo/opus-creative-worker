import type { ContentUnit } from "./contracts";

const hardGateFlags = new Set([
  "paid_spend",
  "patient_media",
  "before_after",
  "medical_claim",
  "testimonial",
  "privacy",
  "compliance_unknown",
]);

export function requiresHumanApproval(unit: ContentUnit) {
  return unit.riskFlags.some((flag) => hardGateFlags.has(flag));
}

export function evaluatePublishGate(unit: ContentUnit) {
  const approvalRequired = requiresHumanApproval(unit);
  const approved = unit.reviewStatus === "approved";

  return {
    approvalRequired,
    canPublish: !approvalRequired || approved,
    reason: approvalRequired && !approved
      ? "Human approval required before publishing."
      : "Publish gate passed.",
  };
}
