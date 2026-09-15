import type { CloudPackage } from '@/lib/cloud-v2-packages';

export type CanonicalTemplateId =
  | 'OPUS-TPL-FIELD-9X16-Q-V01'
  | 'OPUS-TPL-PORTRAIT-9X16-E-V01'
  | 'OPUS-TPL-SIGNAL-9X16-Q-V01'
  | 'OPUS-TPL-COLUMN-4X5-E-V01'
  | 'OPUS-TPL-EVIDENCE-4X5-I-V01'
  | 'OPUS-TPL-FIELD-4X5-Q-V01'
  | 'OPUS-TPL-LOCAL-4X3-Q-V01'
  | 'OPUS-TPL-THUMB-16X9-E-V01';

export type ProductionJob = {
  id: string;
  contentId: string;
  createdAt: string;
  state: 'QUEUED' | 'CANVA_PENDING' | 'CANVA_CREATED' | 'BLOCKED';
  templateId: CanonicalTemplateId;
  canvaSourceDesignId: string;
  canvaDesignId?: string;
  canvaUrl?: string;
  error?: string;
};

type RenderMaster = {
  canvaDesignId: string;
  archetype: 'FIELD' | 'PORTRAIT' | 'SIGNAL' | 'COLUMN' | 'EVIDENCE' | 'LOCAL' | 'THUMB';
  surface: '9X16' | '4X5' | '4X3' | '16X9';
  density: 'Q' | 'E' | 'I';
  class: 'GOLD' | 'CHANNEL';
};

/**
 * Stable OPUS render contracts.
 *
 * The original six entries remain the gold masters. LOCAL 4:3 and THUMB 16:9
 * are channel masters promoted only because Google Business and long-form
 * YouTube have genuinely different platform behavior.
 */
export const OPUS_GOLD_MASTERS: Record<CanonicalTemplateId, RenderMaster> = {
  'OPUS-TPL-FIELD-9X16-Q-V01': {
    canvaDesignId: 'DAHVQMlcFZU',
    archetype: 'FIELD',
    surface: '9X16',
    density: 'Q',
    class: 'GOLD',
  },
  'OPUS-TPL-PORTRAIT-9X16-E-V01': {
    canvaDesignId: 'DAHVQEOEtxk',
    archetype: 'PORTRAIT',
    surface: '9X16',
    density: 'E',
    class: 'GOLD',
  },
  'OPUS-TPL-SIGNAL-9X16-Q-V01': {
    canvaDesignId: 'DAHVQJ0f42k',
    archetype: 'SIGNAL',
    surface: '9X16',
    density: 'Q',
    class: 'GOLD',
  },
  'OPUS-TPL-COLUMN-4X5-E-V01': {
    canvaDesignId: 'DAHVQNx_bEk',
    archetype: 'COLUMN',
    surface: '4X5',
    density: 'E',
    class: 'GOLD',
  },
  'OPUS-TPL-EVIDENCE-4X5-I-V01': {
    canvaDesignId: 'DAHVQGvVU0s',
    archetype: 'EVIDENCE',
    surface: '4X5',
    density: 'I',
    class: 'GOLD',
  },
  'OPUS-TPL-FIELD-4X5-Q-V01': {
    canvaDesignId: 'DAHVQHHgv5Q',
    archetype: 'FIELD',
    surface: '4X5',
    density: 'Q',
    class: 'GOLD',
  },
  'OPUS-TPL-LOCAL-4X3-Q-V01': {
    canvaDesignId: 'DAHVQU0YydA',
    archetype: 'LOCAL',
    surface: '4X3',
    density: 'Q',
    class: 'CHANNEL',
  },
  'OPUS-TPL-THUMB-16X9-E-V01': {
    canvaDesignId: 'DAHVQSJCWrE',
    archetype: 'THUMB',
    surface: '16X9',
    density: 'E',
    class: 'CHANNEL',
  },
};

/**
 * Temporary fallback for worker packages that predate Content Pipeline
 * Template ID. New production should pass the Template ID selected on the
 * existing Notion record; this fallback does not create a second taxonomy.
 */
const legacyLaneFallback: Record<CloudPackage['lane'], CanonicalTemplateId | null> = {
  youtube_anchor: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
  shorts: 'OPUS-TPL-PORTRAIT-9X16-E-V01',
  paid: 'OPUS-TPL-SIGNAL-9X16-Q-V01',
  stories: 'OPUS-TPL-FIELD-9X16-Q-V01',
  website: 'OPUS-TPL-COLUMN-4X5-E-V01',
  google_business: 'OPUS-TPL-LOCAL-4X3-Q-V01',
};

export function isCanonicalTemplateId(value: unknown): value is CanonicalTemplateId {
  return typeof value === 'string' && value in OPUS_GOLD_MASTERS;
}

export function compileCanvaPayload(
  item: CloudPackage,
  requestedTemplateId?: CanonicalTemplateId,
) {
  const templateId = requestedTemplateId ?? legacyLaneFallback[item.lane];

  if (!templateId) {
    throw new Error('No approved OPUS render master exists for this content lane.');
  }

  const template = OPUS_GOLD_MASTERS[templateId];

  return {
    templateId,
    canvaSourceDesignId: template.canvaDesignId,
    archetype: template.archetype,
    surface: template.surface,
    density: template.density,
    title: `OPUS_${item.topic}_${template.archetype}-${template.surface}-${template.density}_${item.id.slice(-6)}_v01`,
    // Semantic content contract. Layout is already authored in Canva; this
    // payload only supplies bounded content for the selected instrument.
    fields: {
      SERIES: item.topic,
      EYEBROW: item.topic,
      HOOK: item.hook,
      HEADLINE: item.cover,
      SUPPORT: item.caption,
      CTA: item.cta,
      META: `${item.file} · ${item.start.toFixed(2)}–${item.end.toFixed(2)}s`,
      PHYSICIAN: 'DR. TYLER FREW · PLASTIC SURGEON',
    },
  };
}
