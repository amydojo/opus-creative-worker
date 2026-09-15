import { NextResponse } from 'next/server';
import { cloudV2Packages } from '@/lib/cloud-v2-packages';
import { isCanonicalTemplateId } from '@/lib/production';
import {
  buildProductionPack,
  type CreativeJob,
  type SourceLane,
} from '@/lib/production-packer';

const jobs = new Set<CreativeJob>(['Magnet', 'Trust', 'Intent', 'Story Support']);
const sourceLanes = new Set<SourceLane>([
  'Frew',
  'Procedure',
  'Proof',
  'OPUS World',
  'Education',
  'People',
  'Local',
  'Conversion',
]);

type RequestBody = {
  contentId?: string;
  campaignOrWeek?: string;
  job?: CreativeJob;
  sourceLane?: SourceLane;
  slug?: string;
  primaryTemplateId?: unknown;
  channels?: string[];
  approval?: string;
  date?: string;
  fields?: {
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

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const item = cloudV2Packages.find((candidate) => candidate.id === body.contentId);

  if (!item) {
    return NextResponse.json({ error: 'Unknown content item' }, { status: 404 });
  }

  if (!body.job || !jobs.has(body.job)) {
    return NextResponse.json({ error: 'Existing Content Pipeline Job is required.' }, { status: 400 });
  }
  if (!body.sourceLane || !sourceLanes.has(body.sourceLane)) {
    return NextResponse.json({ error: 'Existing Content Pipeline Source Lane is required.' }, { status: 400 });
  }
  if (!isCanonicalTemplateId(body.primaryTemplateId)) {
    return NextResponse.json({ error: 'Valid canonical Template ID is required.' }, { status: 400 });
  }

  const pack = buildProductionPack({
    contentId: item.id,
    campaignOrWeek: body.campaignOrWeek?.trim() || 'W3',
    job: body.job,
    sourceLane: body.sourceLane,
    slug: body.slug?.trim() || item.topic,
    primaryTemplateId: body.primaryTemplateId,
    channels: body.channels ?? [],
    approval: body.approval?.trim() || 'Needs approval',
    date: body.date?.trim() || new Date().toISOString().slice(0, 10).replaceAll('-', ''),
    fields: {
      series: body.fields?.series,
      hook: body.fields?.hook || item.hook,
      headline: body.fields?.headline || item.cover,
      support: body.fields?.support || item.caption,
      proof: body.fields?.proof || item.transcript,
      cta: body.fields?.cta || item.cta,
      meta: body.fields?.meta || `${item.file} · ${item.start.toFixed(2)}–${item.end.toFixed(2)}s`,
      physician: body.fields?.physician,
    },
  });

  return NextResponse.json({
    contentId: item.id,
    strategy: {
      job: body.job,
      sourceLane: body.sourceLane,
      channels: body.channels ?? [],
      approval: body.approval ?? 'Needs approval',
      primaryTemplateId: body.primaryTemplateId,
    },
    pack,
    execution: {
      mode: 'CANVA_PLUGIN_BOUND',
      reason: 'Canva Connect Autofill is plan-gated in the current workspace. The production contract is still deterministic; execute via authored-master copy + bounded edit operations.',
      folder: `OPUS · PRODUCTION / ${new Date().toISOString().slice(0, 7)} / Ask Dr. Frew`,
      publish: false,
    },
  });
}
