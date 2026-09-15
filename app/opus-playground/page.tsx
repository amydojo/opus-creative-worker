'use client';

import { type FormEvent, useMemo, useState } from 'react';
import type { OpusDeliverable, OpusPackage } from '@/lib/ai/opus-package';

type SaveMode = 'draft' | 'review';
type SavedLink = { id: string; url: string | null; label: string; stage: string; approval: string };

const jobs = ['Magnet', 'Trust', 'Intent', 'Story Support'] as const;
const funnels = ['Discover', 'Consider', 'Convert'] as const;
const sourceLanes = ['Frew', 'Procedure', 'Proof', 'OPUS World', 'Education', 'People', 'Local', 'Conversion'] as const;
const kpis = ['Hook rate', 'Watch time', 'Shares', 'Saves', 'Comments', 'Profile visits', 'CTR', 'Leads', 'Consults'] as const;
const testVariables = ['Hook', 'Visual', 'Angle', 'CTA', 'Length', 'Format'] as const;

function Gate({ unit }: { unit: OpusDeliverable }) {
  const labels = [
    unit.qualityGate.utility && 'UTILITY',
    unit.qualityGate.novelty && 'NOVELTY',
    unit.qualityGate.desire && 'DESIRE',
    unit.qualityGate.humanity && 'HUMANITY',
    unit.qualityGate.proof && 'PROOF',
  ].filter(Boolean);

  return (
    <div className="aiGate">
      <strong>{unit.qualityGate.score}/5</strong>
      <span>{labels.join(' · ') || 'QUALITY GATE FAILED'}</span>
    </div>
  );
}

export default function OpusPlayground() {
  const [sourceLabel, setSourceLabel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [objective, setObjective] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<OpusPackage | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<SavedLink[]>([]);

  const selectedDerivatives = useMemo(
    () => result?.derivatives.filter((_, index) => selected.has(index)) ?? [],
    [result, selected],
  );

  async function generate(event: FormEvent) {
    event.preventDefault();
    setGenerating(true);
    setError('');
    setSaved([]);
    setSelected(new Set());

    try {
      const response = await fetch('/api/opus/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, sourceLabel, campaign, objective }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Package generation failed.');
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Package generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  function patchPrimary(patch: Partial<OpusDeliverable>) {
    setResult((current) => current ? { ...current, primary: { ...current.primary, ...patch } } : current);
  }

  function patchPrimaryCopy(patch: Partial<OpusDeliverable['copy']>) {
    setResult((current) => current ? {
      ...current,
      primary: { ...current.primary, copy: { ...current.primary.copy, ...patch } },
    } : current);
  }

  async function saveOne(deliverable: OpusDeliverable, mode: SaveMode, label: string) {
    const key = `${mode}:${label}`;
    setSaving(key);
    setError('');
    try {
      const response = await fetch('/api/opus/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverable, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Notion save failed.');
      setSaved((current) => [...current, { ...data, label }]);
      return data;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Notion save failed.');
      throw cause;
    } finally {
      setSaving(null);
    }
  }

  async function saveSelectedDerivatives() {
    if (!result || !selectedDerivatives.length) return;
    setSaving('derivatives');
    setError('');
    try {
      for (const derivative of selectedDerivatives) {
        const response = await fetch('/api/opus/notion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliverable: derivative, mode: 'draft' }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`${derivative.deliverable}: ${data.error || 'Notion save failed.'}`);
        setSaved((current) => [...current, { ...data, label: derivative.deliverable }]);
      }
      setSelected(new Set());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Derivative save failed.');
    } finally {
      setSaving(null);
    }
  }

  function toggleDerivative(index: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <main className="aiPlayground">
      <header className="aiHeader">
        <div>
          <a className="backLink" href="/">← CREATIVE DESK</a>
          <p className="eyebrow">OPUS CREATIVE WORKER / AI PACKAGE LANE V0.2</p>
          <h1>Package the source.</h1>
          <p className="lede">Raw transcript in. OPUS strategy, copy, risk flags, and useful derivatives out. Nothing touches Notion until you choose to save it.</p>
        </div>
        <div className="aiStatusBox">
          <span className="tiny">CONTROL CONTRACT</span>
          <strong>AI proposes. You commit.</strong>
          <p>Generation cannot publish, approve, clear paid rights, or manufacture clinical clearance.</p>
        </div>
      </header>

      <form className="aiIntake" onSubmit={generate}>
        <div className="aiMetaGrid">
          <label><span>SOURCE LABEL</span><input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} placeholder="Thursday shoot · Frew answer 04" /></label>
          <label><span>CAMPAIGN</span><input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="First Access / W3 / optional" /></label>
          <label><span>OBJECTIVE</span><input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What should this source accomplish?" /></label>
        </div>
        <label className="aiTranscript"><span>RAW TRANSCRIPT</span><textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste the real transcript here. The system will find the strongest editorial premise instead of summarizing everything." /></label>
        <button className="aiPrimaryButton" disabled={generating || transcript.trim().length < 20}>{generating ? 'PACKAGING…' : 'PACKAGE THIS'}</button>
      </form>

      {error && <div className="aiError"><b>BLOCKED</b><span>{error}</span></div>}

      {saved.length > 0 && <section className="aiSavedRail"><span className="tiny">SAVED TO EXISTING CONTENT PIPELINE</span>{saved.map((item, index) => <div key={`${item.id}-${index}`}><b>{item.label}</b><span>{item.stage} · {item.approval}</span>{item.url && <a href={item.url} target="_blank" rel="noreferrer">OPEN IN NOTION ↗</a>}</div>)}</section>}

      {result && <>
        {result.packageWarnings.length > 0 && <section className="aiWarnings"><span className="tiny">PACKAGE WARNINGS</span>{result.packageWarnings.map((warning) => <p key={warning}>{warning}</p>)}</section>}

        <section className="aiPrimaryCard">
          <div className="aiCardRail">
            <span className="tiny">PRIMARY / {result.primary.job}</span>
            <strong>{result.primary.copy.onScreenTitle}</strong>
            <Gate unit={result.primary} />
            <div className="aiRiskList">{result.primary.riskFlags.length ? result.primary.riskFlags.map((risk) => <span key={risk}>⚠ {risk}</span>) : <span>NO HARD RISK FLAG DETECTED</span>}</div>
          </div>

          <div className="aiEditor">
            <div className="aiEditorTop"><div><span className="tiny">EDITORIAL PREMISE</span><p>{result.primary.editorialPremise}</p></div><div><span className="tiny">WHY THIS MATTERS</span><p>{result.primary.whyThisMatters}</p></div></div>

            <div className="aiSelectGrid">
              <label><span>JOB</span><select value={result.primary.job} onChange={(e) => patchPrimary({ job: e.target.value as OpusDeliverable['job'] })}>{jobs.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>FUNNEL</span><select value={result.primary.funnel} onChange={(e) => patchPrimary({ funnel: e.target.value as OpusDeliverable['funnel'] })}>{funnels.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>SOURCE LANE</span><select value={result.primary.sourceLane} onChange={(e) => patchPrimary({ sourceLane: e.target.value as OpusDeliverable['sourceLane'] })}>{sourceLanes.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>PRIMARY KPI</span><select value={result.primary.primaryKpi} onChange={(e) => patchPrimary({ primaryKpi: e.target.value as OpusDeliverable['primaryKpi'] })}>{kpis.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>TEST</span><select value={result.primary.testVariable} onChange={(e) => patchPrimary({ testVariable: e.target.value as OpusDeliverable['testVariable'] })}>{testVariables.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>

            <label><span>DELIVERABLE</span><input value={result.primary.deliverable} onChange={(e) => patchPrimary({ deliverable: e.target.value })} /></label>
            <label><span>HOOK</span><textarea className="shortArea" value={result.primary.hook} onChange={(e) => patchPrimary({ hook: e.target.value })} /></label>
            <label><span>ON-SCREEN TITLE</span><input value={result.primary.copy.onScreenTitle} onChange={(e) => patchPrimaryCopy({ onScreenTitle: e.target.value })} /></label>
            <label><span>ONE MESSAGE</span><textarea className="shortArea" value={result.primary.oneMessage} onChange={(e) => patchPrimary({ oneMessage: e.target.value })} /></label>
            <label><span>PROOF</span><textarea className="shortArea" value={result.primary.proof} onChange={(e) => patchPrimary({ proof: e.target.value })} /></label>
            <label><span>CAPTION</span><textarea value={result.primary.copy.caption} onChange={(e) => patchPrimaryCopy({ caption: e.target.value })} /></label>
            <label><span>CTA</span><input value={result.primary.cta} onChange={(e) => patchPrimary({ cta: e.target.value })} /></label>

            <div className="aiSaveRow">
              <button onClick={() => saveOne(result.primary, 'draft', result.primary.deliverable)} disabled={!!saving}>{saving?.startsWith('draft:') ? 'SAVING…' : 'SAVE DRAFT'}</button>
              <button className="reviewButton" onClick={() => saveOne(result.primary, 'review', result.primary.deliverable)} disabled={!!saving}>{saving?.startsWith('review:') ? 'ROUTING…' : 'SEND FOR REVIEW →'}</button>
              <span>Draft → Inbox. Review → Approval / Needs approval.</span>
            </div>
          </div>
        </section>

        <section className="aiDerivatives">
          <div className="aiSectionHead"><div><p className="eyebrow">DERIVATIVES</p><h2>Only make the useful ones.</h2></div><p>The model may suggest surfaces. They do not become pipeline work until you select them.</p></div>
          <div className="aiDerivativeGrid">
            {result.derivatives.map((item, index) => <article className={selected.has(index) ? 'aiDerivative selected' : 'aiDerivative'} key={`${item.deliverable}-${index}`}>
              <label className="aiCheck"><input type="checkbox" checked={selected.has(index)} onChange={() => toggleDerivative(index)} /><span>MAKE THIS REAL</span></label>
              <span className="tiny">{item.job} · {item.format} · {item.channels.join(' + ')}</span>
              <h3>{item.copy.onScreenTitle}</h3>
              <p>{item.hook}</p>
              <Gate unit={item} />
              <div className="aiRiskList">{item.riskFlags.map((risk) => <span key={risk}>⚠ {risk}</span>)}</div>
            </article>)}
          </div>
          {result.derivatives.length === 0 && <div className="emptyState"><p className="eyebrow">GOOD RESTRAINT</p><h2>No derivative deserved to exist.</h2></div>}
          {result.derivatives.length > 0 && <div className="aiDerivativeActions"><button disabled={!selected.size || !!saving} onClick={saveSelectedDerivatives}>{saving === 'derivatives' ? 'SAVING…' : `SAVE SELECTED DERIVATIVES · ${selected.size}`}</button><span>Selected derivatives save as Inbox drafts only.</span></div>}
        </section>
      </>}
    </main>
  );
}
