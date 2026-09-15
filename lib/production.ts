import type { CloudPackage } from '@/lib/cloud-v2-packages';

export type ProductionJob = {
  id:string; contentId:string; createdAt:string; state:'QUEUED'|'CANVA_PENDING'|'CANVA_CREATED'|'BLOCKED';
  templateId:string; canvaDesignId?:string; canvaUrl?:string; error?:string;
};

const templates={
  youtube_anchor:'DAHVQEOEtxk',
  shorts:'DAHVQJ0f42k',
  google_business:'DAHVQGvVU0s',
  stories:'DAHVQMlcFZU',
  paid:'DAHVQJ0f42k',
  website:'DAHVQNx_bEk',
} as const;

export function compileCanvaPayload(item:CloudPackage){
 const templateId=templates[item.lane] ?? 'DAHVQCDHTSk';
 return {
   templateId,
   title:`OPUS · ${item.cover} · ${item.id.slice(-6)}`,
   fields:{
     cover:item.cover,
     hook:item.hook,
     caption:item.caption,
     cta:item.cta,
     source_file:item.file,
     source_start:item.start,
     source_end:item.end,
   }
 };
}
