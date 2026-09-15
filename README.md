# OPUS Creative Worker / OPUS OS

OPUS Creative Worker is the production layer for Opus Plastic Surgery marketing: a small creative OS that turns approved source material into channel-ready social, ad, YouTube, Story, Google Business, and patient-education assets with as little repetitive manual work as possible.

## Core rule

**The computer owns repetition. Human review owns taste, patient privacy, medical claims, and paid spend.**

Automation handles routing, media prep, layout selection, bounded copy/media replacement, derivatives, QA, review state, and packaging. Consequential decisions stay behind approval gates.

## Authority

1. Notion Growth Canon — strategy and jobs
2. Notion Content Pipeline — execution truth and learning
3. Canonical OPUS Figma system — creative system and master composition
4. Canva — downstream production renderer
5. OPUS OS — orchestration, QA, routing, and packaging

No Canva database. No parallel calendar. No duplicate approval tracker. No new strategy taxonomy.

## System shape

`SOURCE → PYTHON MEDIA WORKER → CONTENT UNIT → CANONICAL TEMPLATE ID → CANVA RENDER CONTRACT → QA → CHANNEL ADAPTERS → REVIEW → PRODUCTION PACK → READY`

### GitHub — brain
Versioned schemas, routing, master registry, pack profiles, QA rules, tests, channel adapters, and the Python media worker live here.

### Vercel — orchestrator
Next.js is the control plane. It owns job state, template routing, copy-capacity QA, approval/rights gates, production-pack planning, and the Canva execution seam.

### Python media worker — heavy media lane
Python owns deterministic media processing: probing, contact sheets, proxy/frame generation, later ASR, scene/silence segmentation, matched before/after crops, and upload manifests.

### Canva — production bay
Figma remains the forge for inventing visual systems. Canva receives only proven patterns worth reproducing. OPUS OS selects layouts; it does not generate layouts from a blank canvas.

## Canva render contracts

### Six V1 gold masters

Stable analytics/routing IDs:

- `OPUS-TPL-FIELD-9X16-Q-V01`
- `OPUS-TPL-PORTRAIT-9X16-E-V01`
- `OPUS-TPL-SIGNAL-9X16-Q-V01`
- `OPUS-TPL-COLUMN-4X5-E-V01`
- `OPUS-TPL-EVIDENCE-4X5-I-V01`
- `OPUS-TPL-FIELD-4X5-Q-V01`

These remain the canonical reusable visual instruments.

### Channel masters

Two platform behaviors are sufficiently different to justify dedicated masters:

- `OPUS-TPL-LOCAL-4X3-Q-V01` — Google Business Profile / local factual update · 1200×900
- `OPUS-TPL-THUMB-16X9-E-V01` — long-form YouTube thumbnail · 1280×720

They are **channel masters, not new strategy families**. TikTok, Facebook, YouTube Shorts and Meta paid reuse the existing gold masters through adapters.

The canonical Template ID stays stable even if the implementation pointer to a Canva design changes after an intentional Figma → Canva promotion.

## Production Packer V2

The first pressure-tested content profile remains:

`TRUST + Frew + PORTRAIT 9:16 → Ask Dr. Frew pack`

It produces three bounded production roles:

1. **COVER** — PORTRAIT · 9:16 · Editorial
2. **STORY_TEASER** — SIGNAL · 9:16 · Quiet
3. **FEED_DERIVATIVE** — COLUMN · 4:5 · Editorial

The feed derivative is not a resized cover. It is a separate authored spatial system using the same strategy record and source idea.

`POST /api/package` now also accepts `Format`, `Channel`, `Approval`, and `Paid-use rights` so it can emit only the useful channel surfaces and adapters while preserving the existing Content Pipeline gates.

### Channel adapter matrix

Adapters do not create duplicate Canva template families:

- **TikTok 9:16** → PORTRAIT · first-frame hook, TikTok UI-safe zones, no Instagram-specific CTA
- **Facebook Reels 9:16** → PORTRAIT · same visual contract, channel nuance in native post copy
- **Facebook Feed 4:5** → COLUMN · editorial feed derivative, never a crop of the vertical cover
- **YouTube Shorts 9:16** → PORTRAIT · silent-safe clarity; title/description stay native to YouTube
- **Meta Paid 9:16** → SIGNAL · silent-safe, message-match, compliance metadata when required
- **Meta Paid 4:5** → COLUMN · explicit conversion clarity while preserving the original creative job

Meta paid adapters fail closed until both Content Pipeline approval and paid-use rights are cleared.

### Dedicated channel outputs

- **Google Business Profile 4:3** uses `LOCAL-4X3-Q` only for factual/local-appropriate Source Lanes.
- **YouTube 16:9 thumbnail** uses `THUMB-16X9-E` only for `Long-form` content. Shorts continue to reuse the vertical master.

## Measured copy QA

Real production pressure tests taught the system layout capacity:

- PORTRAIT 9:16 fails closed when display/support copy exceeds measured master capacity.
- COLUMN 4:5 checks both total copy capacity and longest display line, because a short single-line headline can still expand into the media column.
- LOCAL 4:3 and THUMB 16:9 have bounded headline/metadata capacities from their authored channel masters.
- QA returns `COPY_REVIEW` / `COPY_CAPACITY_EXCEEDED`; automation must shorten, reroute, or insert an authored line break. It must **never shrink typography until copy fits**.

## Canva execution reality

Canva Connect Autofill is Enterprise-gated in the current workspace. OPUS OS therefore does not pretend remote autofill succeeded.

Current working path:

`select canonical master → copy authored master → bounded Canva edit operations → preview → explicit save approval → file production instance`

The API exposes this honestly as a plugin-bound execution seam. If the Canva plan later unlocks Connect Autofill, the semantic contract is already in place.

## Canva file architecture

- `OPUS · BRAND SYSTEM`
- `OPUS · MASTER RACK`
  - `01 · VERTICAL · 9×16`
  - `02 · FEED · 4×5`
  - `03 · LOCAL · 4×3`
  - `04 · LONG FORM · 16×9`
- `OPUS · CAMPAIGN KITS`
- `OPUS · PRODUCTION / YYYY-MM / series-or-campaign`
- `OPUS · ARCHIVE`

Campaign kits contain references or campaign-ready copies, never new design-system authority. Production contains real instances, never canonical masters.

## Creative Desk V0.6

- `MAKE IT` creates the primary production job.
- `PACKAGE IT` returns authored Canva surfaces plus channel adapters.
- The pack view exposes each unique render role, Template ID, QA state, channel adapter, surface, and gate state.
- No auto-publishing.
- Approval, paid-use rights, clinical/compliance, and spend gates remain intact.

The UI expands reusable contracts only after they are deliberately authored or proven; it does not assume every content item deserves the same derivative bundle.

## Golden path

1. Register footage, photos, transcript, or campaign brief.
2. Run deterministic media prep in Python.
3. Resolve the existing Notion strategy record.
4. Select the canonical Template ID.
5. Populate a copied Canva render contract with bounded content.
6. Run copy/layout/compliance QA.
7. Apply channel adapters instead of creating duplicate template families.
8. Pause when approval or rights are required.
9. File production instances in Canva and return links to the existing Notion record.
10. Publish only after the existing approval workflow clears the asset.

## Safety / approval policy

Always require explicit human approval for:

- paid advertising or spend changes
- patient images, testimonials, before/after assets, or protected information
- medical claims, outcomes, guarantees, comparative claims, or risk-sensitive wording
- anything marked by QA as ambiguous or non-compliant

A production pack never changes `Approval`, `Paid-use rights`, or publishing status on its own.

## Next gates

1. Consume current Notion execution records directly in PACKAGE IT instead of duplicating strategy fields in the UI request.
2. Add durable workflow pause/resume for Canva plugin-bound steps.
3. Add ASR + clip scoring to the Python media worker.
4. Add before/after pairing, matched crop solving, and READY_UPLOAD manifests.
5. Promote another content-specific pack profile only after repeated production friction proves the need.

## Operating principle

The goal is not another dashboard to babysit. The target interaction is closer to:

> Package this approved source for the channels already on the Content Pipeline record.

OPUS OS should do the repetitive work, then surface only the decisions that actually require a person.

---

## AI Package Lane V0.2

The AI Package Lane adds a human-gated editorial intelligence step without changing the authority model above.

`RAW TRANSCRIPT → OPUS AI PACKAGE → HUMAN REVIEW → EXISTING NOTION CONTENT PIPELINE → CANVA / QA / APPROVAL`

Open `/opus-playground` to paste a real transcript plus optional source label, campaign, and objective. The server uses Vercel AI SDK 7 structured output through AI Gateway with `openai/gpt-5.6-sol`. The package schema is constrained to the existing OPUS vocabulary for Job, Funnel, Source Lane, Channel, Format, Primary KPI, Test Variable, and risk flags.

### Save behavior

Generation never mutates Notion. A person reviews and can edit the primary package first.

- `SAVE DRAFT` creates exactly one existing Content Pipeline record with `Stage = Inbox`.
- `SEND FOR REVIEW` creates exactly one record with `Stage = Approval` and `Approval = Needs approval`.
- AI-created records always start with `Paid-use rights = Unknown` and `Boost Status = Not planned`.
- Hard-risk flags force `Approval = Needs approval` even when the record is saved as an Inbox draft.
- Derivatives remain suggestions until individually selected. Selected derivatives save as separate Inbox records because the Content Pipeline contract is one record per real deliverable.
- The AI lane cannot set Scheduled, Published, Approved, Paid cleared, Clinical Set, Clinical Consent, Clinical QA, or Clinical Approval.

### Existing Notion target

The AI lane writes only to the existing `OPUS · Content Pipeline` data source:

`38148c16-95da-4a40-b6f0-bc664ca04e02`

No schema changes are required. Canonical database properties receive compact execution fields; richer material such as editorial premise, caption, Story frames, quality gate, risk flags, and next step lives in the created page body.

### Environment

Vercel Preview/Production uses AI Gateway through Vercel OIDC. Local development may use a Vercel OIDC environment or `AI_GATEWAY_API_KEY`.

Required for Notion save actions:

```bash
NOTION_ACCESS_TOKEN=secret_...
```

Optional non-secret override:

```bash
NOTION_CONTENT_PIPELINE_DATA_SOURCE_ID=38148c16-95da-4a40-b6f0-bc664ca04e02
```

Never commit `.env` files or secrets.

### Local setup and validation

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run build
```

`npm run build` executes `typecheck` before `next build`, so a Vercel preview cannot pass while the TypeScript contract is broken.

### AI lane architecture

- `lib/ai/opus-prompt.ts` — locked OPUS editorial, brand, growth, and compliance intelligence
- `lib/ai/opus-package.ts` — structured output schema using canonical Content Pipeline vocabulary
- `app/api/opus/package/route.ts` — AI SDK 7 structured-generation route
- `lib/notion/client.ts` — Notion API `2026-03-11` client and canonical data-source target
- `lib/notion/save-deliverable.ts` — single-record, human-gated Notion write path
- `app/api/opus/notion/route.ts` — validated save endpoint
- `app/opus-playground/page.tsx` — editable operator surface and derivative selection
- `lib/policy.ts` — shared hard-risk gate used by both the original worker and AI package lane

The Creative Desk remains the main dashboard. The AI Playground is an additional operator surface, not a replacement control plane.
