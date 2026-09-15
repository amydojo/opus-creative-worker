import type { CanonicalTemplateId } from '@/lib/production';

export type CreativeJob = 'Magnet' | 'Trust' | 'Intent' | 'Story Support';
export type SourceLane = 'Frew' | 'Procedure' | 'Proof' | 'OPUS World' | 'Education' | 'People' | 'Local' | 'Conversion';
export type ContentFormat = 'Reel' | 'Story' | 'Carousel' | 'Still' | 'Short' | 'Long-form' | 'Before / After' | 'Ad Creative' | 'Other';

export type PackRequest = {
  contentId: string;
  campaignOrWeek: string;
  job: CreativeJob;
  sourceLane: SourceLane;
  format: ContentFormat;
  slug: string;
  primaryTemplateId: CanonicalTemplateId;
  channels: string[];
  approval: string;
  paidUseRights: string;
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
  role: 'COVER' | 'STORY_TEASER' | 'FEED_DERIVATIVE' | 'GBP_LOCAL' | 'YOUTUBE_THUMB';
  templateId: CanonicalTemplateId;
  title: string;
  surface: '9X16' | '4X5' | '4X3' | '16X9';
  density: 'Q' | 'E' | 'I';
  purpose: string;
  semanticFields: Record<string, string>;
  qa: {
    status: 'READY_FOR_CANVA' | 'COPY_REVIEW' | 'GATE_BLOCKED';
    reasons: string[];
  };
};

export type ChannelAdapter = {
  id:
    | 'META_PAID_VERTICAL_V1'
    | 'META_PAID_FEED_V1'
    | 'TIKTOK_VERTICAL_V1'
    | 'FACEBOOK_REELS_V1'
    | 'FACEBOOK_FEED_V1'
    | 'YOUTUBE_SHORTS_V1';
  channel: 'Meta Ads' | 'TikTok' | 'Facebook' | 'YouTube';
  templateId: CanonicalTemplateId;
  surface: '9X16' | '4X5';
  sourceRole: 'COVER' | 'FEED_DERIVATIVE';
  purpose: string;
  copyRules: string[];
  safeAreaRules: string[];
  gate: {
    status: 'READY' | 'HOLD';
    reasons: string[];
  };
};

export type ProductionPack = {
  state: 'PACK_READY' | 'PACK_BLOCKED';
  profile: string;
  approvalGate: 'PRESERVE';
  publishGate: 'NO_AUTO_PUBLISH';
  outputs: PackOutput[];
  adapters: ChannelAdapter[];
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
    HEADLINE: 24,
    SUPPORT: 220,
    CTA: 36,
    META: 54,
  },
  'OPUS-TPL-LOCAL-4X3-Q-V01': {
    EYEBROW: 24,
    HEADLINE: 42,
    META: 40,
  },
  'OPUS-TPL-THUMB-16X9-E-V01': {
    SERIES: 22,
    HEADLINE: 24,
    PHYSICIAN: 28,
    META: 32,
  },
};

const lineCaps: Partial<Record<CanonicalTemplateId, Record<string, number>>> = {
  'OPUS-TPL-COLUMN-4X5-E-V01': {
    HEADLINE: 9,
  },
  'OPUS-TPL-THUMB-16X9-E-V01': {
    HEADLINE: 12,
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

function includesChannel(req: PackRequest, channel: string) {
  return req.channels.some((candidate) => candidate.trim().toLowerCase() === channel.toLowerCase());
}

function checkCopy(templateId: CanonicalTemplateId, fields: Record<string, string>) {
  const templateCaps = caps[templateId];
  const templateLineCaps = lineCaps[templateId];
  if (!templateCaps && !templateLineCaps) {
    return { status: 'READY_FOR_CANVA' as const, reasons: [] as string[] };
  }

  const reasons: string[] = [];
  for (const [field, value] of Object.entries(fields)) {
    const max = templateCaps?.[field];
    if (value && typeof max === 'number' && value.length > max) {
      reasons.push(`${field} ${value.length}/${max} chars — shorten or reroute; never shrink typography to force fit.`);
    }

    const maxLine = templateLineCaps?.[field];
    if (value && typeof maxLine === 'number') {
      const longestLine = Math.max(...value.split('\n').map((line) => line.length));
      if (longestLine > maxLine) {
        reasons.push(`${field} longest line ${longestLine}/${maxLine} chars — add an authored line break or shorten copy to protect the composition.`);
      }
    }
  }

  return {
    status: reasons.length ? ('COPY_REVIEW' as const) : ('READY_FOR_CANVA' as const),
    reasons,
  };
}

function title(req: PackRequest, role: string, template: CanonicalTemplateId) {
  const archetype = template.replace('OPUS-TPL-', '').replace('-V01', '');
  return `OPUS_${req.campaignOrWeek}_${jobToken(req.job)}_${slugify(req.slug)}_${role}_${archetype}_${req.date}_v01`;
}

function paidGate(req: PackRequest) {
  const approvalReady = req.approval.trim().toLowerCase() === 'approved';
  const rightsReady = /paid|cleared|approved/i.test(req.paidUseRights) && !/organic only|unknown/i.test(req.paidUseRights);
  const reasons: string[] = [];
  if (!approvalReady) reasons.push('Content Pipeline approval is not Approved.');
  if (!rightsReady) reasons.push(`Paid-use rights are not cleared (${req.paidUseRights || 'unset'}).`);
  return { status: reasons.length ? ('HOLD' as const) : ('READY' as const), reasons };
}

function buildChannelAdapters(req: PackRequest): ChannelAdapter[] {
  const adapters: ChannelAdapter[] = [];

  if (includesChannel(req, 'TikTok')) {
    adapters.push({
      id: 'TIKTOK_VERTICAL_V1',
      channel: 'TikTok',
      templateId: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
      surface: '9X16',
      sourceRole: 'COVER',
      purpose: 'Native vertical packaging without creating a TikTok-specific visual language.',
      copyRules: ['Lead with the first-frame idea; remove Instagram-specific CTA language.', 'Keep display copy shorter than the spoken hook.'],
      safeAreaRules: ['Protect the right-side interaction rail.', 'Keep critical copy out of the lower caption/navigation zone.'],
      gate: { status: 'READY', reasons: [] },
    });
  }

  if (includesChannel(req, 'Facebook')) {
    adapters.push(
      {
        id: 'FACEBOOK_REELS_V1',
        channel: 'Facebook',
        templateId: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
        surface: '9X16',
        sourceRole: 'COVER',
        purpose: 'Reuse the canonical vertical package for Facebook Reels; channel nuance belongs in post copy.',
        copyRules: ['Preserve the canonical headline hierarchy.', 'Allow additional context in the Facebook post caption, not on the design.'],
        safeAreaRules: ['Use the same vertical safe area as the Reel master.'],
        gate: { status: 'READY', reasons: [] },
      },
      {
        id: 'FACEBOOK_FEED_V1',
        channel: 'Facebook',
        templateId: 'OPUS-TPL-COLUMN-4X5-E-V01',
        surface: '4X5',
        sourceRole: 'FEED_DERIVATIVE',
        purpose: 'Purpose-built 4:5 Facebook feed derivative; never a wide crop of the vertical cover.',
        copyRules: ['Use the editorial 4:5 derivative as-is; place extra explanation in the native caption.'],
        safeAreaRules: ['Protect the image column and authored headline line breaks.'],
        gate: { status: 'READY', reasons: [] },
      },
    );
  }

  if (includesChannel(req, 'YouTube') && req.format !== 'Long-form') {
    adapters.push({
      id: 'YOUTUBE_SHORTS_V1',
      channel: 'YouTube',
      templateId: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
      surface: '9X16',
      sourceRole: 'COVER',
      purpose: 'Reuse the vertical authority package for Shorts; title/description packaging stays native to YouTube.',
      copyRules: ['Do not add YouTube title/description text to the visual.', 'Keep first-frame meaning understandable without audio.'],
      safeAreaRules: ['Protect lower UI/title area and right-side controls.'],
      gate: { status: 'READY', reasons: [] },
    });
  }

  if (includesChannel(req, 'Meta Ads')) {
    const gate = paidGate(req);
    adapters.push(
      {
        id: 'META_PAID_VERTICAL_V1',
        channel: 'Meta Ads',
        templateId: 'OPUS-TPL-SIGNAL-9X16-Q-V01',
        surface: '9X16',
        sourceRole: 'COVER',
        purpose: 'Silent-safe paid vertical adapter using an existing OPUS master, not a separate ad visual language.',
        copyRules: ['One message only.', 'Message-match the campaign destination.', 'Expose physician/license/legal fields when the compliance gate requires them.'],
        safeAreaRules: ['Keep CTA and required metadata clear of Reels/Stories UI zones.'],
        gate,
      },
      {
        id: 'META_PAID_FEED_V1',
        channel: 'Meta Ads',
        templateId: 'OPUS-TPL-COLUMN-4X5-E-V01',
        surface: '4X5',
        sourceRole: 'FEED_DERIVATIVE',
        purpose: 'Paid 4:5 feed adapter from the proven editorial system with explicit conversion clarity.',
        copyRules: ['Preserve the creative job; do not rewrite proven MAGNET/TRUST work into generic direct response.', 'Message-match CTA/destination and include required compliance metadata.'],
        safeAreaRules: ['Preserve the authored image column and line-break geometry.'],
        gate,
      },
    );
  }

  return adapters;
}

export function buildProductionPack(req: PackRequest): ProductionPack {
  const isAskFrew =
    req.job === 'Trust' &&
    req.sourceLane === 'Frew' &&
    req.primaryTemplateId === 'OPUS-TPL-PORTRAIT-9X16-E-V01';

  const safeHeadline = compact(req.fields.headline || req.fields.hook);
  const outputs: PackOutput[] = [];

  if (isAskFrew) {
    const coverFields: Record<string, string> = {
      SERIES: compact(req.fields.series || 'ASK DR. FREW'),
      HEADLINE: safeHeadline,
      SUPPORT: compact(req.fields.support || req.fields.hook),
      META: compact(req.fields.meta),
      PHYSICIAN: compact(req.fields.physician || 'DR. TYLER FREW · PLASTIC SURGEON'),
    };

    const storyFields: Record<string, string> = {
      SERIES: compact(req.fields.series || 'ASK DR. FREW'),
      HEADLINE: safeHeadline,
      SUPPORT: compact(req.fields.hook),
      CTA: compact(req.fields.cta || 'WATCH THE ANSWER'),
    };

    const feedFields: Record<string, string> = {
      EYEBROW: compact(req.fields.series || 'ASK DR. FREW'),
      HEADLINE: safeHeadline,
      SUPPORT: compact(req.fields.support || req.fields.proof),
      CTA: compact(req.fields.cta),
      META: compact(req.fields.meta || req.fields.physician),
    };

    outputs.push(
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
    );
  }

  if (includesChannel(req, 'Google Business Profile')) {
    const allowedLocalLane = ['Local', 'OPUS World', 'People', 'Conversion'].includes(req.sourceLane);
    const localFields: Record<string, string> = {
      EYEBROW: 'LOCAL UPDATE',
      HEADLINE: safeHeadline,
      META: compact(req.fields.meta || 'UPLAND · OPUS PLASTIC SURGERY'),
    };
    outputs.push({
      role: 'GBP_LOCAL',
      templateId: 'OPUS-TPL-LOCAL-4X3-Q-V01',
      title: title(req, 'GBP', 'OPUS-TPL-LOCAL-4X3-Q-V01'),
      surface: '4X3',
      density: 'Q',
      purpose: 'Factual Google Business local update with one image and restrained local metadata.',
      semanticFields: localFields,
      qa: allowedLocalLane
        ? checkCopy('OPUS-TPL-LOCAL-4X3-Q-V01', localFields)
        : { status: 'GATE_BLOCKED', reasons: [`${req.sourceLane} is not a factual/local source lane for GBP. Reroute or use a Local / OPUS World / People / Conversion source.`] },
    });
  }

  if (includesChannel(req, 'YouTube') && req.format === 'Long-form') {
    const thumbFields: Record<string, string> = {
      SERIES: compact(req.fields.series || 'ASK DR. FREW'),
      HEADLINE: safeHeadline,
      PHYSICIAN: compact(req.fields.physician || 'DR. TYLER FREW'),
      META: 'OPUS PLASTIC SURGERY',
    };
    outputs.push({
      role: 'YOUTUBE_THUMB',
      templateId: 'OPUS-TPL-THUMB-16X9-E-V01',
      title: title(req, 'YT-THUMB', 'OPUS-TPL-THUMB-16X9-E-V01'),
      surface: '16X9',
      density: 'E',
      purpose: 'Long-form YouTube thumbnail: one strong visual plus a short 2–5 word idea.',
      semanticFields: thumbFields,
      qa: checkCopy('OPUS-TPL-THUMB-16X9-E-V01', thumbFields),
    });
  }

  const adapters = buildChannelAdapters(req);
  if (!outputs.length && !adapters.length) {
    return {
      state: 'PACK_BLOCKED',
      profile: 'UNPROVEN',
      approvalGate: 'PRESERVE',
      publishGate: 'NO_AUTO_PUBLISH',
      outputs: [],
      adapters: [],
      notes: [
        'No proven production-pack or channel-adapter contract exists for this request.',
        'Do not invent a parallel template family; use the primary master or promote a genuinely different platform behavior into canon.',
      ],
    };
  }

  return {
    state: 'PACK_READY',
    profile: isAskFrew ? 'ASK_FREW_TRUST_CHANNEL_PACK_V2' : 'CHANNEL_PACK_V1',
    approvalGate: 'PRESERVE',
    publishGate: 'NO_AUTO_PUBLISH',
    outputs,
    adapters,
    notes: [
      'Canva Connect Autofill may be Enterprise-gated. When it is, execute the same deterministic plan through Canva copy + bounded edit operations.',
      'Channel adapters reuse canonical masters; they do not create a TikTok/Facebook/Meta/Shorts visual language.',
      'Meta paid adapters fail closed until Content Pipeline approval and paid-use rights are cleared.',
      'Production pack does not auto-publish or change Content Pipeline approval, compliance, clinical, or spend gates.',
    ],
  };
}
