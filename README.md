# OPUS Creative Worker / OPUS OS

OPUS Creative Worker is the production layer for Opus Plastic Surgery marketing: a small creative OS that turns approved source material into channel-ready social, ad, YouTube, Story, and patient-education assets with as little repetitive manual work as possible.

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

`SOURCE → PYTHON MEDIA WORKER → CONTENT UNIT → CANONICAL TEMPLATE ID → CANVA GOLD MASTER → QA → REVIEW → PRODUCTION PACK → READY`

### GitHub — brain
Versioned schemas, routing, master registry, pack profiles, QA rules, tests, and the Python media worker live here.

### Vercel — orchestrator
Next.js is the control plane. It owns job state, template routing, copy-capacity QA, approval gates, production-pack planning, and the Canva execution seam.

### Python media worker — heavy media lane
Python owns deterministic media processing: probing, contact sheets, proxy/frame generation, later ASR, scene/silence segmentation, matched before/after crops, and upload manifests.

### Canva — production bay
Figma remains the forge for inventing visual systems. Canva receives only proven patterns worth reproducing. OPUS OS selects layouts; it does not generate layouts from a blank canvas.

## Canva V1 gold masters

Stable analytics/routing IDs:

- `OPUS-TPL-FIELD-9X16-Q-V01`
- `OPUS-TPL-PORTRAIT-9X16-E-V01`
- `OPUS-TPL-SIGNAL-9X16-Q-V01`
- `OPUS-TPL-COLUMN-4X5-E-V01`
- `OPUS-TPL-EVIDENCE-4X5-I-V01`
- `OPUS-TPL-FIELD-4X5-Q-V01`

The canonical Template ID stays stable even if the implementation pointer to a Canva design changes after an intentional Figma → Canva promotion.

## Production Packer V1

The first proven package profile is intentionally narrow:

`TRUST + Frew + PORTRAIT 9:16 → Ask Dr. Frew pack`

It produces three bounded production roles:

1. **COVER** — PORTRAIT · 9:16 · Editorial
2. **STORY_TEASER** — SIGNAL · 9:16 · Quiet
3. **FEED_DERIVATIVE** — COLUMN · 4:5 · Editorial

The feed derivative is not a resized cover. It is a separate authored spatial system using the same strategy record and source idea.

`POST /api/package` requires the existing Content Pipeline Job, Source Lane, canonical Template ID, and strategy fields. It refuses unproven pack combinations instead of inventing new families.

### Measured copy QA

Real production pressure tests taught the system layout capacity:

- PORTRAIT 9:16 fails closed when display/support copy exceeds measured master capacity.
- COLUMN 4:5 checks both total copy capacity and longest display line, because a short single-line headline can still expand into the media column.
- QA returns `COPY_REVIEW` / `COPY_CAPACITY_EXCEEDED`; automation must shorten, reroute, or insert an authored line break. It must **never shrink typography until copy fits**.

## Canva execution reality

Canva Connect Autofill is Enterprise-gated in the current workspace. OPUS OS therefore does not pretend remote autofill succeeded.

Current working path:

`select canonical master → copy authored master → bounded Canva edit operations → preview → explicit save approval → file production instance`

The API exposes this honestly as a plugin-bound execution seam. If the Canva plan later unlocks Connect Autofill, the semantic contract is already in place.

## Canva file architecture

- `OPUS · BRAND SYSTEM`
- `OPUS · MASTER RACK`
- `OPUS · CAMPAIGN KITS`
- `OPUS · PRODUCTION / YYYY-MM / series-or-campaign`
- `OPUS · ARCHIVE`

Campaign kits contain references or campaign-ready copies, never new design-system authority. Production contains real instances, never canonical masters.

## Creative Desk V0.5

- `MAKE IT` creates the primary production job.
- `PACKAGE IT` appears only for the first pressure-tested Ask Dr. Frew profile.
- The packer returns the three canonical derivative roles and per-output QA state.
- No auto-publishing.
- Approval, rights, and compliance gates remain intact.

The UI expands pack profiles only after they are proven in real production; it does not assume every content item deserves the same derivative bundle.

## Golden path

1. Register footage, photos, transcript, or campaign brief.
2. Run deterministic media prep in Python.
3. Resolve the existing Notion strategy record.
4. Select the canonical Template ID.
5. Populate a copied Canva gold master with bounded content.
6. Run copy/layout/compliance QA.
7. Pause when approval is required.
8. If a proven pack profile exists, create only the useful surface derivatives.
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

1. Finish the first real Ask Dr. Frew pack and preserve the measured layout learnings.
2. Add Notion-to-packer payload sync so the control plane consumes the execution record without duplicated strategy data.
3. Add durable workflow pause/resume for Canva plugin-bound steps.
4. Add ASR + clip scoring to the Python media worker.
5. Add before/after pairing, matched crop solving, and READY_UPLOAD manifests.
6. Promote another pack profile only after repeated production friction proves the need.

## Operating principle

The goal is not another dashboard to babysit. The target interaction is closer to:

> Package this approved Ask Dr. Frew clip.

OPUS OS should do the repetitive work, then surface only the decisions that actually require a person.
