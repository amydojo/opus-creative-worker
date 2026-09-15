'use client';

import { useMemo, useState } from 'react';
import { cloudV2Packages, cloudV2Summary, type CloudPackage } from '@/lib/cloud-v2-packages';

type ReviewState = 'REVIEW' | 'READY' | 'SKIP';
type Item = CloudPackage & { reviewState: ReviewState };
const lanes = ['all','youtube_anchor','shorts','google_business'] as const;
type Lane = typeof lanes[number];

function stamp(seconds: number) { const m=Math.floor(seconds/60); const s=Math.floor(seconds%60); return `${m}:${String(s).padStart(2,'0')}`; }
function laneLabel(lane: string) { return lane.replaceAll('_',' ').toUpperCase(); }

export function CreativeDesk() {
  const [lane, setLane] = useState<Lane>('all');
  const [items, setItems] = useState<Item[]>(cloudV2Packages.map((item) => ({...item, reviewState:'REVIEW'})));
  const visible = useMemo(() => items.filter((item) => item.reviewState !== 'SKIP' && (lane === 'all' || item.lane === lane)), [items,lane]);
  const approved = items.filter((item) => item.reviewState === 'READY').length;
  const needsReview = items.filter((item) => item.reviewState === 'REVIEW').length;
  function setState(id:string, reviewState:ReviewState) { setItems((current) => current.map((item) => item.id===id ? {...item,reviewState} : item)); }

  return <main>
    <section className="topbar">
      <div><p className="eyebrow">OPUS CREATIVE DESK / EDITORIAL PASS 01</p><h1>Eight moments worth your attention.</h1><p className="lede">The worker found 148 candidates. This pass removes slate junk, weak cut boundaries, duplicate ideas and generic machine copy so you only review the strongest usable directions.</p></div>
      <div className="summaryCard"><span className="tiny">THURSDAY SHOOT</span><strong>CURATED SHORTLIST</strong><div className="summaryGrid"><div><b>{cloudV2Summary.candidates}</b><span>scanned</span></div><div><b>{items.length}</b><span>shortlisted</span></div><div><b>{approved}</b><span>approved</span></div></div></div>
    </section>

    <section className="actionBar"><div><span className="statusDot" /><span>TRANSCRIPT CLEANUP APPLIED · {needsReview} DECISIONS LEFT</span></div><span className="tiny">SOURCE VERIFY BEFORE EXPORT</span></section>

    <section className="resultsHeader"><div><p className="eyebrow">DECISION INBOX</p><h2>Approve the idea, not the machine output.</h2></div><p>Clean transcript edges and editorial copy are proposed here. Source meaning is preserved; flagged trims, medical language and before/after language still require final source/compliance verification.</p></section>
    <div className="laneTabs">{lanes.map((value)=><button className={lane===value?'active':''} key={value} onClick={()=>setLane(value)}>{value==='all'?'TOP 8':laneLabel(value)}</button>)}</div>

    <section className="results">{visible.map((item,index)=><article className="resultCard" key={item.id}>
      <div className="rank">{String(index+1).padStart(2,'0')}</div>
      <div className="resultMain">
        <div className="metaRow"><span>{laneLabel(item.lane)}</span><span>{item.tier} TIER · {Math.round(item.score*100)}</span><span>{item.file} · {stamp(item.start)}–{stamp(item.end)}</span></div>
        <h3>{item.hook}</h3>
        <p className="why">“{item.transcript}”</p>
        <div className="copyBlock"><span className="tiny">COVER</span><p>{item.cover}</p></div>
        <div className="copyBlock"><span className="tiny">EDITORIAL CAPTION</span><p>{item.caption} <strong>{item.cta}</strong></p></div>
        {item.reviewFlags.length>0 && <div className="copyBlock"><span className="tiny">FINAL CHECK</span><p>{item.reviewFlags.join(' · ')}</p></div>}
      </div>
      <aside className="resultSide"><span className={`pill pill-${item.reviewState==='READY'?'ready':'review'}`}>{item.reviewState==='READY'?'Approved':'Needs your taste'}</span><button onClick={()=>setState(item.id,'READY')}>{item.reviewState==='READY'?'APPROVED':'APPROVE'}</button><button className="quiet" onClick={()=>setState(item.id,'SKIP')}>SKIP</button></aside>
    </article>)}</section>

    <section className="bottomRail"><div><span className="tiny">EDITORIAL REDUCTION</span><p>148 worker candidates → 29 channel packages → 8 distinct directions worth reviewing.</p></div><div><span className="tiny">YOUR JOB</span><p>{approved ? `${approved} approved. ` : ''}Approve or skip. The system keeps source verification and compliance-sensitive language gated before export.</p></div></section>
  </main>;
}
