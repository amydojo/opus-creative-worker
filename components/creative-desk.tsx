'use client';

import { upload } from '@vercel/blob/client';
import { useMemo, useRef, useState } from 'react';
import { demoItems } from '@/lib/demo-content';

type DeskItem = (typeof demoItems)[number] & { source?: string };

const statusCopy = { READY: 'Ready to use', REVIEW: 'Needs your taste', BLOCKED: 'Approval required' } as const;

function buildUploadedItems(files: File[], urls: string[]): DeskItem[] {
  const subjects = ['Strongest standalone answer', 'Clean authority cut', 'Paid candidate — review first', 'Story follow-up'];
  const hooks = ['The part patients usually miss.', 'What Dr. Frew looks at before making a recommendation.', 'Not every visible problem needs the same solution.', 'One useful thing to know before a consultation.'];
  return files.slice(0, 4).map((file, index) => ({
    id: `upload-${index}`,
    format: index === 2 ? 'META AD CANDIDATE' : index === 3 ? 'STORY' : 'REEL / SHORT',
    timestamp: 'SOURCE',
    score: Math.max(82, 96 - index * 4),
    title: subjects[index] ?? 'Usable cut',
    why: `Uploaded ${file.name}. Media is safely registered; Python analysis will replace this provisional card with transcript timestamps, clip boundaries, and ranked creative decisions.`,
    hook: hooks[index] ?? 'A useful patient question, answered clearly.',
    caption: index === 2 ? 'Paid derivative held for human review before use.' : 'Source received. Final caption will be generated from the transcript instead of guessed from the filename.',
    status: index === 2 ? 'BLOCKED' : 'REVIEW',
    source: urls[index],
  }));
}

export function CreativeDesk() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<DeskItem[]>(demoItems);
  const [batch, setBatch] = useState('Thursday shoot · seeded demo');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('Drop real footage to replace the seeded batch.');
  const readyCount = useMemo(() => items.filter((item) => item.status === 'READY').length, [items]);

  async function processFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    setBusy(true);
    setProgress(0);
    setNotice(`Uploading ${files.length} source file${files.length === 1 ? '' : 's'}…`);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const blob = await upload(`opus/source/${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: true,
          onUploadProgress(event) {
            setProgress(Math.round(((i + event.percentage / 100) / files.length) * 100));
          },
        });
        urls.push(blob.url);
      }
      setItems(buildUploadedItems(files, urls));
      setBatch(`${files.length} source file${files.length === 1 ? '' : 's'} · uploaded now`);
      setNotice('Sources uploaded. Board populated; Python transcript/ranking pass is the next active stage.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  function updateStatus(id: string, status: DeskItem['status']) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  return (
    <main>
      <section className="topbar">
        <div><p className="eyebrow">OPUS CREATIVE DESK</p><h1>Give it footage. Get your week back.</h1><p className="lede">Upload the shoot once. Work from ranked outputs and decisions instead of folders, exports, and marketing busywork.</p></div>
        <div className="summaryCard"><span className="tiny">CURRENT BATCH</span><strong>{batch}</strong><div className="summaryGrid"><div><b>{items.length}</b><span>cuts</span></div><div><b>{readyCount}</b><span>approved</span></div><div><b>{items.filter((i) => i.status === 'BLOCKED').length}</b><span>hard gates</span></div></div></div>
      </section>

      <section className="actionBar">
        <div><span className="statusDot" /><span>{busy ? `UPLOAD ${progress}%` : notice}</span></div>
        <input ref={inputRef} hidden multiple type="file" accept="video/mp4,video/quicktime,video/x-m4v,audio/*" onChange={(event) => void processFiles(event.target.files)} />
        <button disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? 'PROCESSING…' : 'NEW SHOOT + PROCESS'}</button>
      </section>
      {busy && <div className="progressTrack"><div style={{ width: `${progress}%` }} /></div>}

      <section className="resultsHeader"><div><p className="eyebrow">BEST OUTPUTS</p><h2>Start here.</h2></div><p>The desk should surface decisions, not make you inspect pipeline machinery.</p></section>
      <section className="results">
        {items.map((item, index) => <article className="resultCard" key={item.id}>
          <div className="rank">{String(index + 1).padStart(2, '0')}</div>
          <div className="resultMain"><div className="metaRow"><span>{item.format}</span><span>{item.timestamp}</span><span>SCORE {item.score}</span></div><h3>{item.title}</h3><p className="why">{item.why}</p><div className="copyBlock"><span className="tiny">HOOK / OVERLAY</span><p>{item.hook}</p></div><div className="copyBlock"><span className="tiny">CAPTION DRAFT</span><p>{item.caption}</p></div>{item.source && <a className="sourceLink" href={item.source} target="_blank" rel="noreferrer">OPEN SOURCE ↗</a>}</div>
          <aside className="resultSide"><span className={`pill pill-${item.status.toLowerCase()}`}>{statusCopy[item.status]}</span><button onClick={() => updateStatus(item.id, item.status === 'BLOCKED' ? 'REVIEW' : 'READY')}>{item.status === 'BLOCKED' ? 'REVIEW' : item.status === 'READY' ? 'APPROVED' : 'APPROVE'}</button><button className="quiet" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>SKIP</button></aside>
        </article>)}
      </section>
      <section className="bottomRail"><div><span className="tiny">WIRED NOW</span><p>Browser → direct multipart media upload → batch board → human decisions.</p></div><div><span className="tiny">NEXT ACTIVE STAGE</span><p>Python worker replaces provisional cards with transcript-grounded cuts, timestamps, and ranked derivatives.</p></div></section>
    </main>
  );
}
