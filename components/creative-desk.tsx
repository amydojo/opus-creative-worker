'use client';

import { useMemo, useState } from 'react';
import { cloudV2Packages, cloudV2Summary, type CloudPackage } from '@/lib/cloud-v2-packages';

type ReviewState = 'REVIEW' | 'READY' | 'SKIP';
type Item = CloudPackage & { reviewState: ReviewState };
const lanes = ['all','youtube_anchor','shorts','paid','google_business'] as const;
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
      <div><p className="eyebrow">OPUS CREATIVE DESK / CLOUD V2</p><h1>The worker already did the ugly part.</h1><p className="lede">Thursday’s Drive masters were streamed through the remote worker, transcribed, segmented and ranked. Review the strongest actual moments instead of scrubbing 23 files.</p></div>
      <div className="summaryCard"><span className="tiny">REAL RUN</span><strong>{cloudV2Summary.runId}</strong><div className="summaryGrid"><div><b>{cloudV2Summary.candidates}</b><span>candidates</span></div><div><b>{cloudV2Summary.sTier}</b><span>S tier</span></div><div><b>{cloudV2Summary.totalPackages}</b><span>packages</span></div></div></div>
    </section>

    <section className="actionBar"><div><span className="statusDot" /><span>ASR COMPLETE · {cloudV2Summary.mediaFiles} MASTERS · {cloudV2Summary.roughCuts} ROUGH CUTS · {needsReview} IN THIS REVIEW SET</span></div><span className="tiny">NO AUTO-PUBLISH</span></section>

    <section className="resultsHeader"><div><p className="eyebrow">DECISION INBOX</p><h2>Pick what deserves daylight.</h2></div><p>Transcript text is worker output, not rewritten copy. Paid and flagged language stays review-gated.</p></section>
    <div className="laneTabs">{lanes.map((value)=><button className={lane===value?'active':''} key={value} onClick={()=>setLane(value)}>{value==='all'?'TOP PICKS':laneLabel(value)}</button>)}</div>

    <section className="results">{visible.map((item,index)=><article className="resultCard" key={item.id}>
      <div className="rank">{String(index+1).padStart(2,'0')}</div>
      <div className="resultMain">
        <div className="metaRow"><span>{laneLabel(item.lane)}</span><span>{item.tier} TIER · {Math.round(item.score*100)}</span><span>{item.file} · {stamp(item.start)}–{stamp(item.end)}</span></div>
        <h3>{item.hook}</h3>
        <p className="why">“{item.transcript}”</p>
        <div className="copyBlock"><span className="tiny">COVER SYSTEM</span><p>{item.cover}</p></div>
        <div className="copyBlock"><span className="tiny">WORKER CAPTION DIRECTION</span><p>{item.caption} <strong>{item.cta}</strong></p></div>
        {item.reviewFlags.length>0 && <div className="copyBlock"><span className="tiny">REVIEW FLAGS</span><p>{item.reviewFlags.join(' · ')}</p></div>}
      </div>
      <aside className="resultSide"><span className={`pill pill-${item.reviewState==='READY'?'ready':'review'}`}>{item.reviewState==='READY'?'Approved':'Needs your taste'}</span><button onClick={()=>setState(item.id,'READY')}>{item.reviewState==='READY'?'APPROVED':'APPROVE'}</button><button className="quiet" onClick={()=>setState(item.id,'SKIP')}>SKIP</button></aside>
    </article>)}</section>

    <section className="bottomRail"><div><span className="tiny">CLOUD RUN</span><p>23 Drive masters → Whisper ASR → 148 timestamped candidates → 28 S-tier → 29 channel packages → 3 rendered rough cuts.</p></div><div><span className="tiny">YOUR JOB</span><p>{approved ? `${approved} approved so far. ` : ''}Approve the moments worth producing. Compliance-sensitive and paid work stays human-gated.</p></div></section>
  </main>;
}
