import { NextResponse } from 'next/server';
import { cloudV2Packages } from '@/lib/cloud-v2-packages';
import {
  compileCanvaPayload,
  isCanonicalTemplateId,
  type CanonicalTemplateId,
} from '@/lib/production';

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
    // Canva copies the authored gold master. It does not generate layout.
    const response = await fetch('https://api.canva.com/rest/v1/designs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'design',
        design_id: compiled.canvaSourceDesignId,
        title: compiled.title,
      }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `Canva ${response.status}`);
    }

    return NextResponse.json({
      id,
      contentId,
      state: 'CANVA_CREATED',
      templateId: compiled.templateId,
      canvaSourceDesignId: compiled.canvaSourceDesignId,
      canvaDesignId: data?.design?.id,
      canvaUrl: data?.design?.urls?.edit_url,
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
