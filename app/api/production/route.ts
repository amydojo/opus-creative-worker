import { NextResponse } from 'next/server';
import { cloudV2Packages } from '@/lib/cloud-v2-packages';
import {
  compileCanvaPayload,
  isCanonicalTemplateId,
  type CanonicalTemplateId,
} from '@/lib/production';

type CanvaDatasetField = { type?: string };
type CanvaDataset = Record<string, CanvaDatasetField>;

type AutofillJob = {
  id?: string;
  status?: 'in_progress' | 'success' | 'failed';
  result?: {
    type?: string;
    design?: {
      id?: string;
      urls?: { edit_url?: string; view_url?: string };
    };
  };
  error?: { message?: string };
};

type SemanticTextKey = 'SERIES' | 'EYEBROW' | 'HOOK' | 'HEADLINE' | 'SUPPORT' | 'PROOF' | 'CTA' | 'META' | 'LEGAL' | 'PHYSICIAN' | 'CAMPAIGN_ID';
type SemanticMediaKey = 'IMAGE_HERO' | 'IMAGE_SECONDARY' | 'IMAGE_DETAIL' | 'IMAGE_BEFORE' | 'IMAGE_AFTER';

type ProductionRequest = {
  contentId?: string;
  templateId?: unknown;
  title?: string;
  fields?: Partial<Record<SemanticTextKey, string>>;
  media?: {
    field?: SemanticMediaKey;
    type?: 'image' | 'video';
    assetId?: string;
  };
};

const CANVA_API = 'https://api.canva.com/rest/v1';
const semanticTextKeys = new Set<SemanticTextKey>([
  'SERIES', 'EYEBROW', 'HOOK', 'HEADLINE', 'SUPPORT', 'PROOF', 'CTA', 'META', 'LEGAL', 'PHYSICIAN', 'CAMPAIGN_ID',
]);
const semanticMediaKeys = new Set<SemanticMediaKey>([
  'IMAGE_HERO', 'IMAGE_SECONDARY', 'IMAGE_DETAIL', 'IMAGE_BEFORE', 'IMAGE_AFTER',
]);

// Measured / authored capacity gates. These fail closed; they never shrink
// typography to force oversized copy into a render contract.
const copyCaps: Partial<Record<CanonicalTemplateId, Partial<Record<SemanticTextKey, number>>>> = {
  'OPUS-TPL-PORTRAIT-9X16-E-V01': {
    SERIES: 24,
    HEADLINE: 18,
    SUPPORT: 95,
    META: 44,
    PHYSICIAN: 44,
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

function canvaHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function getCopyCapacityViolations(
  templateId: CanonicalTemplateId,
  fields: Partial<Record<SemanticTextKey, string>>,
) {
  const caps = copyCaps[templateId];
  if (!caps) return [];

  return Object.entries(caps).flatMap(([key, max]) => {
    const value = fields[key as SemanticTextKey];
    if (!value || typeof max !== 'number' || value.length <= max) return [];
    return [{ field: key, maxChars: max, actualChars: value.length }];
  });
}

async function readDesignDataset(token: string, designId: string) {
  const response = await fetch(`${CANVA_API}/designs/${designId}/dataset`, {
    headers: canvaHeaders(token),
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Canva dataset ${response.status}`);
  }
  return (data?.dataset ?? {}) as CanvaDataset;
}

async function pollAutofill(token: string, jobId: string): Promise<AutofillJob> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(`${CANVA_API}/autofills/${jobId}`, {
      headers: canvaHeaders(token),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `Canva autofill status ${response.status}`);
    }

    const job = data?.job as AutofillJob;
    if (job?.status === 'success' || job?.status === 'failed') return job;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return { id: jobId, status: 'in_progress' };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProductionRequest;
  const { contentId } = body;
  const item = cloudV2Packages.find((candidate) => candidate.id === contentId);

  if (!item) {
    return NextResponse.json({ error: 'Unknown content item' }, { status: 404 });
  }

  let requestedTemplateId: CanonicalTemplateId | undefined;
  if (body.templateId !== undefined) {
    if (!isCanonicalTemplateId(body.templateId)) {
      return NextResponse.json(
        { error: 'Unknown OPUS canonical Template ID' },
        { status: 400 },
      );
    }
    requestedTemplateId = body.templateId;
  }

  let compiled: ReturnType<typeof compileCanvaPayload>;
  try {
    compiled = compileCanvaPayload(item, requestedTemplateId);
  } catch (error) {
    return NextResponse.json(
      {
        contentId,
        state: 'BLOCKED',
        error: error instanceof Error ? error.message : 'Template routing blocked',
      },
      { status: 409 },
    );
  }

  const requestedFields: Partial<Record<SemanticTextKey, string>> = {};
  for (const [key, value] of Object.entries(body.fields ?? {})) {
    if (semanticTextKeys.has(key as SemanticTextKey) && typeof value === 'string') {
      requestedFields[key as SemanticTextKey] = value;
    }
  }

  const semanticFields = { ...compiled.fields, ...requestedFields };
  const title = body.title?.trim() || compiled.title;
  const id = `job_${contentId}_${Date.now()}`;

  const capacityViolations = getCopyCapacityViolations(compiled.templateId, semanticFields);
  if (capacityViolations.length > 0) {
    return NextResponse.json(
      {
        id,
        contentId,
        state: 'QA_FAILED',
        failure: 'COPY_CAPACITY_EXCEEDED',
        templateId: compiled.templateId,
        canvaSourceDesignId: compiled.canvaSourceDesignId,
        violations: capacityViolations,
        compiled: { ...compiled, title, fields: semanticFields },
        error: 'Copy exceeds the authored master capacity. Shorten or reroute the copy; do not shrink typography to force a fit.',
      },
      { status: 422 },
    );
  }

  const token = process.env.CANVA_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      id,
      contentId,
      state: 'CANVA_PENDING',
      templateId: compiled.templateId,
      canvaSourceDesignId: compiled.canvaSourceDesignId,
      compiled: { ...compiled, title, fields: semanticFields },
      needsConnection: true,
    });
  }

  try {
    const dataset = await readDesignDataset(token, compiled.canvaSourceDesignId);
    const autofillData: Record<
      string,
      { type: 'text'; text: string } | { type: 'image' | 'video'; asset_id: string }
    > = {};

    for (const [key, value] of Object.entries(semanticFields)) {
      if (dataset[key]?.type === 'text' && typeof value === 'string' && value.trim()) {
        autofillData[key] = { type: 'text', text: value };
      }
    }

    const media = body.media;
    if (
      media?.field &&
      semanticMediaKeys.has(media.field) &&
      media.assetId &&
      media.type &&
      dataset[media.field]?.type === media.type
    ) {
      autofillData[media.field] = { type: media.type, asset_id: media.assetId };
    }

    if (Object.keys(autofillData).length === 0) {
      return NextResponse.json(
        {
          id,
          contentId,
          state: 'BLOCKED',
          templateId: compiled.templateId,
          canvaSourceDesignId: compiled.canvaSourceDesignId,
          compiled: { ...compiled, title, fields: semanticFields },
          error: 'Selected Canva master has no committed matching semantic autofill fields.',
        },
        { status: 409 },
      );
    }

    const createResponse = await fetch(`${CANVA_API}/autofills`, {
      method: 'POST',
      headers: canvaHeaders(token),
      body: JSON.stringify({
        type: 'create_from_design',
        design_id: compiled.canvaSourceDesignId,
        title,
        data: autofillData,
      }),
      cache: 'no-store',
    });
    const createData = await createResponse.json();
    if (!createResponse.ok) {
      const message = createData?.message || `Canva autofill ${createResponse.status}`;
      const enterpriseBlocked = createResponse.status === 403 || /enterprise/i.test(message);

      if (enterpriseBlocked) {
        return NextResponse.json(
          {
            id,
            contentId,
            state: 'CANVA_PLUGIN_REQUIRED',
            templateId: compiled.templateId,
            canvaSourceDesignId: compiled.canvaSourceDesignId,
            compiled: { ...compiled, title, fields: semanticFields },
            media: media ?? null,
            error: message,
            fallback: 'COPY_AUTHORED_MASTER_AND_APPLY_BOUNDED_EDITS',
          },
          { status: 409 },
        );
      }

      throw new Error(message);
    }

    const autofillJobId = createData?.job?.id as string | undefined;
    if (!autofillJobId) throw new Error('Canva autofill job did not return an ID');

    const job = await pollAutofill(token, autofillJobId);
    if (job.status === 'failed') {
      throw new Error(job.error?.message || 'Canva autofill failed');
    }

    if (job.status !== 'success') {
      return NextResponse.json(
        {
          id,
          contentId,
          state: 'CANVA_PENDING',
          templateId: compiled.templateId,
          canvaSourceDesignId: compiled.canvaSourceDesignId,
          canvaAutofillJobId: autofillJobId,
          compiled: { ...compiled, title, fields: semanticFields },
        },
        { status: 202 },
      );
    }

    return NextResponse.json({
      id,
      contentId,
      state: 'CANVA_CREATED',
      templateId: compiled.templateId,
      canvaSourceDesignId: compiled.canvaSourceDesignId,
      canvaAutofillJobId: autofillJobId,
      canvaDesignId: job.result?.design?.id,
      canvaUrl: job.result?.design?.urls?.edit_url,
      compiled: { ...compiled, title, fields: semanticFields },
    });
  } catch (error) {
    return NextResponse.json(
      {
        id,
        contentId,
        state: 'BLOCKED',
        templateId: compiled.templateId,
        canvaSourceDesignId: compiled.canvaSourceDesignId,
        compiled: { ...compiled, title, fields: semanticFields },
        error: error instanceof Error ? error.message : 'Canva compilation failed',
      },
      { status: 502 },
    );
  }
}
