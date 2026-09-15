# OPUS Creative Worker

OPUS Creative Worker is the production layer for Opus Plastic Surgery marketing: a small creative OS that turns approved source material into channel-ready social, ad, YouTube, story, and patient-education assets with as little repetitive manual work as possible.

## Core rule

**The computer owns repetition. Human review owns taste, patient privacy, medical claims, and paid spend.**

This repo is intentionally designed so automation handles the boring parts — content routing, structured copy, Canva population, derivatives, QA, review state, and output packaging — while consequential decisions stay behind approval gates.

## Golden path

`SOURCE → CONTENT UNIT → CANVA MASTER → QA → REVIEW → DERIVATIVES → READY`

For a typical shoot, the target flow is:

1. Ingest a clip, transcript, approved photo set, or campaign brief.
2. Convert it into structured content units such as Reel, carousel, Story, YouTube, or paid-ad candidates.
3. Select an approved Opus Canva master and populate controlled fields instead of redesigning from scratch.
4. Run copy/compliance and visual QA.
5. Pause when human approval is required.
6. Apply reviewer feedback where safe and supported.
7. Create channel-specific derivatives and a final publishing manifest.

## System boundaries

### GitHub — brain
Versioned schemas, prompts, canon, workflow logic, QA rules, tests, and integration code live here.

### Vercel — orchestrator
The app and durable worker run on Vercel. Long-running production jobs should be resumable and step-based so Canva/API failures or approval delays do not destroy progress.

### Canva — production bay
Figma can remain the place where a new visual language is invented. Once a master is approved, Canva becomes the high-volume factory for population, image replacement, review, resizing, localization, and derivative creation.

## V0 scope

The first useful release should make one workflow excellent before expanding:

**Thursday shoot clip → structured brief/copy → approved Canva master → visual/compliance QA → review gate → IG + Story derivatives**

Initial worker lanes:

- **Intake** — source registration and metadata
- **Content** — structured angle, hook, body, CTA, channel classification
- **Canva Compiler** — approved-master selection and field population
- **Quality Gate** — visual, copy, brand, privacy, and compliance checks
- **Review Gate** — human-in-the-loop approval and reviewer feedback
- **Output** — channel derivatives plus publishing manifest

## Safety / approval policy

Automatic publishing is out of scope for V0.

Always require explicit human approval for:

- paid advertising or spend changes
- patient images, testimonials, before/after assets, or protected information
- medical claims, outcomes, guarantees, comparative claims, or risk-sensitive wording
- anything marked by QA as ambiguous or non-compliant

Organic low-risk derivatives may eventually move automatically after their source master and copy are already approved.

## Suggested content contract

Every piece of content should resolve to a structured record with fields such as:

- source ID
- content type / channel
- angle
- hook
- body / caption
- CTA
- Canva master ID
- asset references
- compliance flags
- review status
- derivative status
- publish status

This makes the worker deterministic enough to debug instead of relying on an unconstrained agent to improvise an entire campaign.

## Development status

**V0 bootstrap — active.**

Repository initialized 2026-09-15. Next milestone: land the application scaffold, connect the repo to a dedicated Vercel project, and verify the first intake → QA route in a preview deployment.
