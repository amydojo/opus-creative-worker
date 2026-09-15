'use client';

import { useMemo, useState } from 'react';
import { cloudV2Packages, type CloudPackage } from '@/lib/cloud-v2-packages';

type Decision='RECOMMENDED'|'APPROVED'|'PASS';
type Stage='TODAY'|'PRODUCTION'|'READY';
type Item=CloudPackage & { decision:Decision; stage:Stage; recommended:boolean; compliance:'CLEAR'|'CHECK'; outputs:string[]; rationale:string };

const priority=['opus-04e9e898fc71','opus-f28e0d28b915','opus-dcb641f936fc','opus-afb7e620170d'];
const outputMap:Record<string,string[]>={
 'opus-04e9e898fc71':['IG Reel','TikTok','YouTube Short'],
 'opus-f28e0d28b915':['IG Reel','TikTok','Story'],
 'opus-dcb641f936fc':['IG Reel','Story','TikTok'],
 'opus-afb7e620170d':['IG Carousel/Reel','Story'],
 'opus-31e345937a0f':['IG Reel','TikTok','Story'],
 'opus-ee247f427667':['IG Reel','TikTok','Story'],
 'opus-4976083473be':['IG Reel','TikTok'],
 'opus-dfa0d1bd747f':['Google Business','IG Reel'],
};
const rationale:Record<string,string>={
 'opus-04e9e898fc71':'Strong surgeon-authority answer with a useful consultation insight.',
 'opus-f28e0d28b915':'Sharp consumer-education hook with immediate save value.',
 'opus-dcb641f936fc':'Makes the patient experience concrete through Tamara instead of generic service language.',
 'opus-afb7e620170d':'Clean introduction that gives Tamara a real role in the OPUS story.',
 'opus-31e345937a0f':'Specific evidence standard that reinforces the before/after accountability position.',
 'opus-ee247f427667':'Human, light construction content that breaks up the authority-heavy batch.',
 'opus-4976083473be':'Contrarian surgeon-selection hook with strong search/social utility.',
 'opus-dfa0d1bd747f':'Strong judgment signal, but safety language needs deliberate review.',
};
function stamp(seconds:number){const m=Math.floor(seconds/60);const s=Math.floor(seconds%60);return `${m}:${String(s).padStart(2,'0')}`}

export function CreativeDesk(){
 const [tab,setTab]=useState<Stage>('TODAY');
 const [expanded,setExpanded]=useState<string|null>(null);
 const [items,setItems]=useState<Item[]>(cloudV2Packages.map(x=>({...x,decision:'RECOMMENDED',stage:'TODAY',recommended:priority.includes(x.id),compliance:x.reviewFlags.some(f=>/medical|before\/after|service|verify/i.test(f))?'CHECK':'CLEAR',outputs:outputMap[x.id]??['IG Reel'],rationale:rationale[x.id]??'Useful source-backed moment from the Thursday batch.'})));
 const today=useMemo(()=>items.filter(x=>x.stage===tab&&x.decision!=='PASS').sort((a,b)=>Number(b.recommended)-Number(a.recommended)),[items,tab]);
 const recommended=items.filter(x=>x.stage==='TODAY'&&x.recommended&&x.decision==='RECOMMENDED');
 const approved=items.filter(x=>x.decision==='APPROVED').length;
 const approve=(id:string)=>setItems(xs=>xs.map(x=>x.id===id?{...x,decision:'APPROVED',stage:'PRODUCTION'}:x));
 const approveBatch=()=>setItems(xs=>xs.map(x=>x.stage==='TODAY'&&x.recommended&&x.decision==='RECOMMENDED'?{...x,decision:'APPROVED',stage:'PRODUCTION'}:x));
 const pass=(id:string)=>setItems(xs=>xs.map(x=>x.id===id?{...x,decision:'PASS'}:x));

 return <main>
  <section className="cockpitHead"><div><p className="eyebrow">OPUS CREATIVE OS / V0.3</p><h1>Make the week.</h1><p className="lede">Thursday is processed. You do not need to review 148 clips — just decide which ideas deserve production.</p></div><div className="weekBox"><span className="tiny">THIS BATCH</span><strong>{recommended.length||approved} recommended now</strong><p>Expected from the current four: 4 core pieces + 7 derivative placements.</p><button onClick={approveBatch} disabled={!recommended.length}>APPROVE RECOMMENDED {recommended.length||4}</button></div></section>

  <nav className="cockpitNav">{(['TODAY','PRODUCTION','READY'] as Stage[]).map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}{x==='PRODUCTION'&&approved?` · ${approved}`:''}</button>)}</nav>

  {tab==='TODAY'&&<section className="briefStrip"><div><span className="tiny">SYSTEM READ</span><b>{recommended.length?`${recommended.length} things worth making first.`:'Recommended batch approved.'}</b></div><p>Everything else is optional. Technical worker data is hidden unless you ask for it.</p></section>}

  <section className="makeGrid">{today.map((item,index)=><article className={`makeCard ${item.recommended?'recommended':''}`} key={item.id}>
   <div className="poster"><span className="posterNo">{String(index+1).padStart(2,'0')}</span><span className="posterKicker">{item.topic.replaceAll('_',' ')}</span><strong>{item.cover}</strong><span className="posterSource">{stamp(item.start)}–{stamp(item.end)}</span></div>
   <div className="makeBody"><div className="cardTop"><span className="tiny">{item.recommended?'MAKE FIRST':'OPTIONAL'}</span><div className="signals"><span className="creativeSignal">CREATIVE · READY</span><span className={item.compliance==='CLEAR'?'clearSignal':'checkSignal'}>COMPLIANCE · {item.compliance}</span></div></div>
    <h2>{item.hook}</h2><p className="rationale">{item.rationale}</p>
    <div className="outputs">{item.outputs.map(x=><span key={x}>{x}</span>)}</div>
    <div className="proposed"><span className="tiny">PROPOSED CAPTION</span><p>{item.caption}</p><b>{item.cta}</b></div>
    {expanded===item.id&&<div className="sourceDetails"><span className="tiny">SOURCE DETAILS</span><p>“{item.transcript}”</p><p>{item.file} · {stamp(item.start)}–{stamp(item.end)} · worker {item.tier}-tier {Math.round(item.score*100)}</p>{item.reviewFlags.length>0&&<p>Checks: {item.reviewFlags.join(' · ')}</p>}</div>}
    <div className="decisionRow"><button onClick={()=>approve(item.id)}>{tab==='TODAY'?'MAKE IT':'MOVE FORWARD'}</button><button className="quiet" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>{expanded===item.id?'CLOSE':'CHANGE / SOURCE'}</button>{tab==='TODAY'&&<button className="quiet" onClick={()=>pass(item.id)}>PASS</button>}</div>
   </div>
  </article>)}</section>

  {!today.length&&<section className="emptyState"><p className="eyebrow">{tab}</p><h2>{tab==='TODAY'?'Decision inbox cleared.':'Nothing here yet.'}</h2><p>{tab==='TODAY'?'The approved ideas have moved into Production.':'Approve something from Today and it will move here.'}</p></section>}

  <footer className="cockpitFoot"><span>148 WORKER CANDIDATES → 8 EDITORIAL PICKS → 4 RECOMMENDED</span><span>NO AUTO-PUBLISH · HUMAN/COMPLIANCE GATE PRESERVED</span></footer>
 </main>;
}
