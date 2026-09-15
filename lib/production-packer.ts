import type { CanonicalTemplateId } from '@/lib/production';

export type CreativeJob = 'Magnet' | 'Trust' | 'Intent' | 'Story Support';
export type SourceLane = 'Frew' | 'Procedure' | 'Proof' | 'OPUS World' | 'Education' | 'People' | 'Local' | 'Conversion';

export type PackRequest = {
  contentId: string;
  campaignOrWeek: string;
  job: CreativeJob;
  sourceLane: SourceLane;
  slug: string;
  primaryTemplateId: CanonicalTemplateId;
  channels: string[];
  approval: string;
  date: string;
  fields: {
    series?: string;
    hook?: string;
    headline?: string;
    support?: string;
    proof?: string;
    cta?: string;
    meta?: string;
    physician?: string;
  };
};

export type PackOutput = {
  role: 'COVER' | 'STORY_TEASER' | 'FEED_DERIVATIVE';
  templateId: CanonicalTemplateId;
  title: string;
  surface: '9X16' | '4X5';
  density: 'Q' | 'E' | 'I';
  purpose: string;
  semanticFields: Record<string, string>;
  qa: {
    status: 'READY_FOR_CANVA' | 'COPY_REVIEW';
    reasons: string[];
  };
};

export type ProductionPack = {
  state: 'PACK_READY' | 'PACK_BLOCKED';
  profile: string;
  approvalGate: 'PRESERVE';
  publishGate: 'NO_AUTO_PUBLISH';
  outputs: PackOutput[];
  notes: string[];
};

const caps: Partial<Record<CanonicalTemplateId, Record<string, number>>> = {
  'OPUS-TPL-PORTRAIT-9X16-E-V01': {
    SERIES: 24,
    HEADLINE: 18,
    SUPPORT: 95,
    META: 44,
    PHYSICIAN: 44,
  },
  'OPUS-TPL-SIGNAL-9X16-Q-V01': {
    SERIES: 24,
    HEADLINE: 30,
    SUPPORT: 80,
    CTA: 28,
  },
  'OPUS-TPL-COLUMN-4X5-E-V01': {
    EYEBROW: 28,
    HEADLINE: 64,
    SUPPORT: 220,
    CTA: 36,
    META: 54,
  },
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';
}

function jobToken(job: CreativeJob) {
  return job.toUpperCase().replace('STORY SUPPORT', 'STORY-SUPPORT');
}

function compact(value: string | undefined) {
  return (value ?? '').trim();
}

function checkCopy(templateId: CanonicalTemplateId, fields: Record<string, string>) {
  const templateCaps = caps[templateId];
  if (!templateCaps) return { status: 'READY_FOR_CANVA' as const, reasons: [] as string[] };
  const reasons = Object.entries(templateCaps).flatMap(([field, max]) => {
    const value = fields[field];
    return value && value.length > max
      ? [`${field} ${value.length}/${max} chars — shorten or reroute; never shrink typography to force fit.`]
      : [];
  });
  return {
    status: reasons.length ? ('COPY_REVIEW' as const) : ('READY_FOR_CANVA' as const),
    reasons,
  };
}

function title(req: PackRequest, role: string, template: CanonicalTemplateId) {
  const archetype = template.replace('OPUS-TPL-', '').replace('-V01', '');
  return `OPUS_${req.campaignOrWeek}_${jobToken(req.job)}_${slugify(req.slug)}_${role}_${archetype}_${req.date}_v01`;
}

/**
 * V1 ships exactly one proven package profile first: TRUST + Frew + vertical
 * PORTRAIT as the source instrument. It deliberately refuses to infer other
 * package families until repeated production friction proves the need.
 */
export function buildProductionPack(req: PackRequest): ProductionPack {
  const isAskFrew =
    req.job === 'Trust' &&
    req.sourceLane === 'Frew' &&
    req.primaryTemplateId === 'OPUS-TPL-PORTRAIT-9X16-E-V01';

  if (!isAskFrew) {
    return {
      state: 'PACK_BLOCKED',
      profile: 'UNPROVEN',
      approvalGate: 'PRESERVE',
      publishGate: 'NO_AUTO_PUBLISH',
      outputs: [],
      notes: [
        'No proven V1 production-pack profile exists for this strategy/template combination.',
        'Do not invent a package family. Use the primary master only or promote a new pattern through Figma after repeated need.',
      ],
    };
  }

  const coverFields: Record<string, string> = {
    SERIES: compact(req.fields.series || 'ASK DR. FREW'),
    HEADLINE: compact(req.fields.headline || req.fields.hook),
    SUPPORT: compact(req.fields.support || req.fields.hook),
    META: compact(req.fields.meta),
    PHYSICIAN: compact(req.fields.physician || 'DR. TYLER FREW · PLASTIC SURGEON'),
  };

  const storyFields: Record<string, string> = {
    SERIES: compact(req.fields.series || 'ASK DR. FREW'),
    HEADLINE: compact(req.fields.headline || req.fields.hook),
    SUPPORT: compact(req.fields.hook),
    CTA: compact(req.fields.cta || 'WATCH THE ANSWER'),
  };

  const feedFields: Record<string, string> = {
    EYEBROW: compact(req.fields.series || 'ASK DR. FREW'),
    HEADLINE: compact(req.fields.hook || req.fields.headline),
    SUPPORT: compact(req.fields.support || req.fields.proof),
    CTA: compact(req.fields.cta),
    META: compact(req.fields.meta || req.fields.physician),
  };

  const outputs: PackOutput[] = [
    {
      role: 'COVER',
      templateId: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
      title: title(req, 'COVER', 'OPUS-TPL-PORTRAIT-9X16-E-V01'),
      surface: '9X16',
      density: 'E',
      purpose: 'Canonical Reel / Short cover and primary vertical packaging.',
      semanticFields: coverFields,
      qa: checkCopy('OPUS-TPL-PORTRAIT-9X16-E-V01', coverFields),
    },
    {
      role: 'STORY_TEASER',
      templateId: 'OPUS-TPL-SIGNAL-9X16-Q-V01',
      title: title(req, 'STORY', 'OPUS-TPL-SIGNAL-9X16-Q-V01'),
      surface: '9X16',
      density: 'Q',
      purpose: 'Sparse Story teaser that points into the approved Reel without rebuilding the creative idea.',
      semanticFields: storyFields,
      qa: checkCopy('OPUS-TPL-SIGNAL-9X16-Q-V01', storyFields),
    },
    {
      role: 'FEED_DERIVATIVE',
      templateId: 'OPUS-TPL-COLUMN-4X5-E-V01',
      title: title(req, 'FEED', 'OPUS-TPL-COLUMN-4X5-E-V01'),
      surface: '4X5',
      density: 'E',
      purpose: 'Purpose-built 4:5 educational derivative; never a blind crop of the vertical cover.',
      semanticFields: feedFields,
      qa: checkCopy('OPUS-TPL-COLUMN-4X5-E-V01', feedFields),
    },
  ];

  return {
    state: 'PACK_READY',
    profile: 'ASK_FREW_TRUST_V1',
    approvalGate: 'PRESERVE',
    publishGate: 'NO_AUTO_PUBLISH',
    outputs,
    notes: [
      'Canva Connect Autofill may be Enterprise-gated. When it is, execute the same plan through Canva copy + bounded edit operations.',
      'Production pack does not change Content Pipeline approval, paid-use rights, campaign logic, or publishing status.',
      'Every output inherits the same strategy record; create a new Content Pipeline record only when a derivative becomes a distinct real deliverable.',
    ],
  };
}
