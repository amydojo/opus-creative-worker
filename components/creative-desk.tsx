'use client';

import { useMemo, useState } from 'react';
import { thursdayRun, type ThursdayRunItem } from '@/lib/thursday-run';

const statusCopy = { REVIEW: 'Needs your taste', BLOCKED: 'Worker blocked', READY: 'Approved' } as const;

function duration(value?: number) {
  if (value == null) return 'NOT ANALYZED';
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return minutes ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
}

export function CreativeDesk() {
  const [items, setItems] = useState<(ThursdayRunItem & { status: 'REVIEW' | 'BLOCKED' | 'READY' })[]>(thursdayRun.items);
  const visible = useMemo(() => items.filter((item) => item.format !== 'TECHNICAL HOLD'), [items]);
  const approved = items.filter((item) => item.status === 'READY').length;
  const blocked = items.filter((item) => item.status === 'BLOCKED').length;

  function updateStatus(id: string, status: 'REVIEW' | 'BLOCKED' | 'READY') {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  return (
    <main>
      <section className="topbar">
        <div>
          <p className="eyebrow">OPUS CREATIVE DESK / REAL WORKER DATA</p>
          <h1>Thursday is already in here.</h1>
          <p className="lede">No re-upload. This board is seeded from the completed Google Drive media-worker manifest and only shows conclusions the run actually supports.</p>
        </div>
        <div className="summaryCard">
          <span className="tiny">CURRENT BATCH</span><strong>{thursdayRun.label}</strong>
          <div className="summaryGrid"><div><b>{thursdayRun.sourceCount}</b><span>sources</span></div><div><b>{thursdayRun.analyzedCount}</b><span>analyzed</span></div><div><b>{thursdayRun.blockedCount}</b><span>blocked</span></div></div>
        </div>
      </section>

      <section className="actionBar">
        <div><span className="statusDot" /><span>DRIVE WORKER RUN LOADED · {approved} APPROVED · {blocked} BLOCKED</span></div>
        <span className="tiny">TRANSCRIPT GATE OPEN</span>
      </section>

      <section className="resultsHeader">
        <div><p className="eyebrow">WORKER ROUTING</p><h2>Start with the real candidates.</h2></div>
        <p>Visual/audio routing is real. Hooks, claims, captions and final S/A/B ranking stay intentionally blank until transcript completion.</p>
      </section>

      <section className="results">
        {visible.map((item, index) => <article className="resultCard" key={item.id}>
          <div className="rank">{String(index + 1).padStart(2, '0')}</div>
          <div className="resultMain">
            <div className="metaRow"><span>{item.format}</span><span>{duration(item.duration)}</span><span>{item.orientation ?? 'UNKNOWN'}</span></div>
            <h3>{item.file}</h3>
            <p className="why">{item.note}</p>
            <div className="copyBlock"><span className="tiny">WORKER READ</span><p>{item.reason}</p></div>
            <div className="copyBlock"><span className="tiny">TECHNICAL SIGNAL</span><p>{item.visualScore != null ? `Visual ${Math.round(item.visualScore * 100)} / Focus ${Math.round(item.focus ?? 0)} / ${item.audioUse}` : 'Oversized source not analyzed — no quality claim made.'}</p></div>
          </div>
          <aside className="resultSide">
            <span className={`pill pill-${item.status.toLowerCase()}`}>{statusCopy[item.status]}</span>
            {item.status !== 'BLOCKED' && <button onClick={() => updateStatus(item.id, 'READY')}>{item.status === 'READY' ? 'APPROVED' : 'APPROVE ROUTE'}</button>}
            <button className="quiet" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>HIDE</button>
          </aside>
        </article>)}
      </section>

      <section className="bottomRail">
        <div><span className="tiny">WIRED NOW</span><p>Google Drive worker manifest → truthful candidate board → human routing decisions.</p></div>
        <div><span className="tiny">NEXT ACTIVE GATE</span><p>Complete transcription plus the five oversized masters, then unlock semantic clip ranking, hooks, captions, claims review, and Canva compilation.</p></div>
      </section>
    </main>
  );
}
