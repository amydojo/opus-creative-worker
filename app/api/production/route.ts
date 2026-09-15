import { NextResponse } from 'next/server';
import { cloudV2Packages } from '@/lib/cloud-v2-packages';
import { compileCanvaPayload } from '@/lib/production';

export async function POST(request:Request){
 const {contentId}=await request.json();
 const item=cloudV2Packages.find(x=>x.id===contentId);
 if(!item) return NextResponse.json({error:'Unknown content item'},{status:404});
 const compiled=compileCanvaPayload(item);
 const id=`job_${contentId}_${Date.now()}`;
 const token=process.env.CANVA_ACCESS_TOKEN;
 if(!token) return NextResponse.json({id,contentId,state:'CANVA_PENDING',templateId:compiled.templateId,compiled,needsConnection:true});
 try{
   const response=await fetch('https://api.canva.com/rest/v1/designs',{
     method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
     body:JSON.stringify({type:'design',design_id:compiled.templateId,title:compiled.title}),cache:'no-store'
   });
   const data=await response.json();
   if(!response.ok) throw new Error(data?.message||`Canva ${response.status}`);
   return NextResponse.json({id,contentId,state:'CANVA_CREATED',templateId:compiled.templateId,canvaDesignId:data?.design?.id,canvaUrl:data?.design?.urls?.edit_url,compiled});
 }catch(error){
   return NextResponse.json({id,contentId,state:'BLOCKED',templateId:compiled.templateId,compiled,error:error instanceof Error?error.message:'Canva compilation failed'},{status:502});
 }
}
