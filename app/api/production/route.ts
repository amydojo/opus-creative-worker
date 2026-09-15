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

const CANVA_API = 'https://api.canva.com/rest/v1';

function canvaHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
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
  const body = await request.json();
  const { contentId } = body as { contentId?: string; templateId?: unknown };
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

  const id = `job_${contentId}_${Date.now()}`;
  const token = process.env.CANVA_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      id,
      contentId,
      state: 'CANVA_PENDING',
      templateId: compiled.templateId,
      canvaSourceDesignId: compiled.canvaSourceDesignId,
      compiled,
      needsConnection: true,
    });
  }

  try {
    // Fail closed if the selected authored master has not yet had its semantic
    // Canva Data fields promoted. A blank copy is not a valid production render.
    const dataset = await readDesignDataset(token, compiled.canvaSourceDesignId);
    const autofillData: Record<string, { type: 'text'; text: string }> = {};

    for (const [key, value] of Object.entries(compiled.fields)) {
      if (dataset[key]?.type === 'text' && typeof value === 'string' && value.trim()) {
        autofillData[key] = { type: 'text', text: value };
      }
    }

    if (Object.keys(autofillData).length === 0) {
      return NextResponse.json(
        {
          id,
          contentId,
          state: 'BLOCKED',
          templateId: compiled.templateId,
          canvaSourceDesignId: compiled.canvaSourceDesignId,
          compiled,
          error: 'Selected Canva master has no committed matching semantic autofill fields.',
        },
        { status: 409 },
      );
    }

    // Layout is selected, never generated. Canva creates a production instance
    // from the tagged source design and replaces only bounded semantic fields.
    const createResponse = await fetch(`${CANVA_API}/autofills`, {
      method: 'POST',
      headers: canvaHeaders(token),
      body: JSON.stringify({
        type: 'create_from_design',
        design_id: compiled.canvaSourceDesignId,
        title: compiled.title,
        data: autofillData,
      }),
      cache: 'no-store',
    });
    const createData = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(createData?.message || `Canva autofill ${createResponse.status}`);
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
          compiled,
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
      compiled,
    });
  } catch (error) {
    return NextResponse.json(
      {
        id,
        contentId,
        state: 'BLOCKED',
        templateId: compiled.templateId,
        canvaSourceDesignId: compiled.canvaSourceDesignId,
        compiled,
        error: error instanceof Error ? error.message : 'Canva compilation failed',
      },
      { status: 502 },
    );
  }
}
