export type DeskItem = {
  id: string;
  title: string;
  format: "REEL" | "STORY" | "YOUTUBE" | "AD";
  score: number;
  timestamp: string;
  why: string;
  hook: string;
  caption: string;
  status: "READY" | "REVIEW" | "BLOCKED";
};

export const demoItems: DeskItem[] = [
  {
    id: "frew-judgment-01",
    title: "What patients usually get wrong about choosing a procedure",
    format: "REEL",
    score: 96,
    timestamp: "00:18–00:54",
    why: "Strong judgment-led answer, fast authority signal, clean standalone clip.",
    hook: "The procedure isn’t the first decision.",
    caption: "A good consultation starts by deciding what actually needs to change — not by choosing a procedure from a menu. Dr. Frew explains the part of the process that matters first.",
    status: "READY",
  },
  {
    id: "frew-aesthetic-02",
    title: "The difference between visible work and good work",
    format: "REEL",
    score: 92,
    timestamp: "03:11–03:47",
    why: "Clear philosophy statement with a premium brand fit and strong comment potential.",
    hook: "Good work shouldn’t introduce itself first.",
    caption: "The goal is not to make surgery obvious. It’s to make the result make sense. A short answer from Dr. Frew on restraint, proportion, and why judgment matters.",
    status: "READY",
  },
  {
    id: "frew-longform-01",
    title: "How Dr. Frew thinks through a consultation",
    format: "YOUTUBE",
    score: 90,
    timestamp: "01:02–06:38",
    why: "Best long-form anchor: multiple useful answers with one coherent theme and clean clip-down potential.",
    hook: "What actually happens in a thoughtful plastic surgery consultation?",
    caption: "A longer conversation about how Dr. Frew evaluates goals, anatomy, tradeoffs, and whether a procedure is actually the right recommendation.",
    status: "REVIEW",
  },
  {
    id: "frew-ad-01",
    title: "First Access — surgeon judgment cut",
    format: "AD",
    score: 88,
    timestamp: "02:14–02:42",
    why: "Immediate authority and a natural bridge into First Access without sounding like a generic clinic ad.",
    hook: "You don’t need more options. You need a better read.",
    caption: "Join Opus First Access for a private early window to request a consultation before public booking opens.",
    status: "BLOCKED",
  },
  {
    id: "tamara-story-01",
    title: "Tamara / patient experience intro",
    format: "STORY",
    score: 84,
    timestamp: "08:03–08:24",
    why: "Humanizes the practice and gives Stories a lighter rhythm between surgeon-heavy posts.",
    hook: "The experience is built between the appointments.",
    caption: "Meet Tamara, the person keeping the patient experience moving before, between, and after appointments.",
    status: "READY",
  },
];
