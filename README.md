# OPUS Creative Worker / OPUS OS

OPUS Creative Worker is the production layer for Opus Plastic Surgery marketing: a small creative OS that turns approved source material into channel-ready social, ad, YouTube, story, and patient-education assets with as little repetitive manual work as possible.

## Core rule

**The computer owns repetition. Human review owns taste, patient privacy, medical claims, and paid spend.**

Automation handles routing, media prep, structured copy, Canva population, derivatives, QA, review state, and packaging. Consequential decisions stay behind approval gates.

## System shape

`SOURCE → PYTHON MEDIA WORKER → CONTENT UNIT → CANVA MASTER → QA → REVIEW → DERIVATIVES → READY`

### GitHub — brain
Versioned schemas, prompts, canon, workflow logic, QA rules, tests, and the Python media worker live here.

### Vercel — orchestrator
Next.js is the control plane. It owns job state, routing, approval gates, API endpoints, Canva handoff, and eventually durable pause/resume workflow execution.

### Python media worker — heavy media lane
Python owns deterministic media processing: probing, contact sheets, proxy/frame generation, later ASR, scene/silence segmentation, matched before/after crops, and upload manifests.

### Canva — production bay
Figma remains the forge for inventing visual systems. Once a master is approved, Canva is the high-volume production surface for population, image replacement, review, resizing, localization, and derivative creation.

## V0.2 now in the repo

- Next.js production console shell
- typed `CreativeJob` and `ContentUnit` contracts
- risk-sensitive approval rules
- `/api/pipeline` planner endpoint
- `/api/demo-job` deterministic sample route
- Python 3.12 media worker using FFmpeg/ffprobe
- optional video contact-sheet generation
- GitHub Actions remote media-worker workflow with stable request IDs
- no auto-publishing and no paid-spend automation

## Golden path

For a typical shoot:

1. Register footage, photos, transcript, or campaign brief.
2. Run deterministic media prep in Python.
3. Convert source material into structured content units such as Reel, carousel, Story, YouTube, or paid-ad candidates.
4. Select an approved Opus Canva master and populate controlled fields instead of redesigning from scratch.
5. Run copy/compliance and visual QA.
6. Pause only when human approval is required.
7. Apply reviewer feedback where safe and supported.
8. Create channel-specific derivatives and a final publishing manifest.

## Safety / approval policy

Automatic publishing is out of scope for V0.

Always require explicit human approval for:

- paid advertising or spend changes
- patient images, testimonials, before/after assets, or protected information
- medical claims, outcomes, guarantees, comparative claims, or risk-sensitive wording
- anything marked by QA as ambiguous or non-compliant

Organic low-risk derivatives may eventually move automatically after their source master and copy are already approved.

## Next gates

1. Verify preview build on Vercel.
2. Promote the V0.2 control plane after build/runtime checks pass.
3. Add durable workflow execution and human approval pause/resume.
4. Connect Canva master registry and controlled autofill/derivative generation.
5. Add ASR + clip scoring to the Python media worker.
6. Add before/after pairing, matched crop solving, and READY_UPLOAD manifests.

## Operating principle

The goal is not another dashboard to babysit. The target interaction is closer to:

> Process Thursday's shoot.

OPUS OS should do the repetitive work, then surface only the decisions that actually require a person.
