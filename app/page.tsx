import { demoItems } from "@/lib/demo-content";

const statusCopy = {
  READY: "Ready to use",
  REVIEW: "Needs your taste",
  BLOCKED: "Approval required",
};

export default function Home() {
  const readyCount = demoItems.filter((item) => item.status === "READY").length;

  return (
    <main>
      <section className="topbar">
        <div>
          <p className="eyebrow">OPUS CREATIVE DESK</p>
          <h1>Give it footage. Get your week back.</h1>
          <p className="lede">
            Drop a shoot, then work from ranked clips, finished hooks, captions, ad candidates, and review gates instead of hunting through files all day.
          </p>
        </div>
        <div className="summaryCard">
          <span className="tiny">CURRENT BATCH</span>
          <strong>Thursday shoot</strong>
          <div className="summaryGrid">
            <div><b>{demoItems.length}</b><span>usable cuts</span></div>
            <div><b>{readyCount}</b><span>ready now</span></div>
            <div><b>1</b><span>paid gate</span></div>
          </div>
        </div>
      </section>

      <section className="actionBar">
        <div>
          <span className="statusDot" />
          <span>DEMO BATCH LOADED</span>
        </div>
        <button disabled>NEW SHOOT — upload wiring next</button>
      </section>

      <section className="resultsHeader">
        <div>
          <p className="eyebrow">BEST OUTPUTS</p>
          <h2>Start here.</h2>
        </div>
        <p>Ranked by standalone clarity, authority, brand fit, and how little editing you need to do.</p>
      </section>

      <section className="results">
        {demoItems.map((item, index) => (
          <article className="resultCard" key={item.id}>
            <div className="rank">0{index + 1}</div>
            <div className="resultMain">
              <div className="metaRow">
                <span>{item.format}</span>
                <span>{item.timestamp}</span>
                <span>SCORE {item.score}</span>
              </div>
              <h3>{item.title}</h3>
              <p className="why">{item.why}</p>
              <div className="copyBlock">
                <span className="tiny">HOOK / OVERLAY</span>
                <p>{item.hook}</p>
              </div>
              <div className="copyBlock">
                <span className="tiny">CAPTION DRAFT</span>
                <p>{item.caption}</p>
              </div>
            </div>
            <aside className="resultSide">
              <span className={`pill pill-${item.status.toLowerCase()}`}>{statusCopy[item.status]}</span>
              <button>{item.status === "BLOCKED" ? "REVIEW AD" : "APPROVE"}</button>
              <button className="quiet">SKIP</button>
            </aside>
          </article>
        ))}
      </section>

      <section className="bottomRail">
        <div><span className="tiny">NEXT BUILD</span><p>Real file upload → Python media analysis → this board populated from the actual shoot.</p></div>
        <div><span className="tiny">SAFETY</span><p>No paid spend, patient media, or publishing moves without a human gate.</p></div>
      </section>
    </main>
  );
}
