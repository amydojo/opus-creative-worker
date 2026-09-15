import type { CloudPackage } from '@/lib/cloud-v2-packages';

export type CanonicalTemplateId =
  | 'OPUS-TPL-FIELD-9X16-Q-V01'
  | 'OPUS-TPL-PORTRAIT-9X16-E-V01'
  | 'OPUS-TPL-SIGNAL-9X16-Q-V01'
  | 'OPUS-TPL-COLUMN-4X5-E-V01'
  | 'OPUS-TPL-EVIDENCE-4X5-I-V01'
  | 'OPUS-TPL-FIELD-4X5-Q-V01';

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

/**
 * Stable OPUS V1 render contracts.
 *
 * The canonical Template ID is the analytics / routing identifier. The Canva
 * design ID is an implementation pointer and may only change when the Figma
 * canon is deliberately promoted to its Canva counterpart.
 */
export const OPUS_GOLD_MASTERS: Record<
  CanonicalTemplateId,
  {
    canvaDesignId: string;
    archetype: 'FIELD' | 'PORTRAIT' | 'SIGNAL' | 'COLUMN' | 'EVIDENCE';
    surface: '9X16' | '4X5';
    density: 'Q' | 'E' | 'I';
  }
> = {
  'OPUS-TPL-FIELD-9X16-Q-V01': {
    canvaDesignId: 'DAHVQMlcFZU',
    archetype: 'FIELD',
    surface: '9X16',
    density: 'Q',
  },
  'OPUS-TPL-PORTRAIT-9X16-E-V01': {
    canvaDesignId: 'DAHVQEOEtxk',
    archetype: 'PORTRAIT',
    surface: '9X16',
    density: 'E',
  },
  'OPUS-TPL-SIGNAL-9X16-Q-V01': {
    canvaDesignId: 'DAHVQJ0f42k',
    archetype: 'SIGNAL',
    surface: '9X16',
    density: 'Q',
  },
  'OPUS-TPL-COLUMN-4X5-E-V01': {
    canvaDesignId: 'DAHVQNx_bEk',
    archetype: 'COLUMN',
    surface: '4X5',
    density: 'E',
  },
  'OPUS-TPL-EVIDENCE-4X5-I-V01': {
    canvaDesignId: 'DAHVQGvVU0s',
    archetype: 'EVIDENCE',
    surface: '4X5',
    density: 'I',
  },
  'OPUS-TPL-FIELD-4X5-Q-V01': {
    canvaDesignId: 'DAHVQHHgv5Q',
    archetype: 'FIELD',
    surface: '4X5',
    density: 'Q',
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
  // LOCAL 4:3 is intentionally specification-only in V1. Do not fake it by
  // silently treating a 4:5 design as a Google Business master.
  google_business: null,
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
    throw new Error(
      'LOCAL 4:3 master is not promoted in V1. Select an approved gold master only for a supported surface, or hold for the Local adapter.',
    );
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
      HOOK: item.hook,
      HEADLINE: item.cover,
      SUPPORT: item.caption,
      CTA: item.cta,
      META: `${item.file} · ${item.start.toFixed(2)}–${item.end.toFixed(2)}s`,
    },
  };
}
