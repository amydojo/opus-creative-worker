const lanes = [
  ["01", "INTAKE", "Register source footage, photos, transcript, or campaign brief."],
  ["02", "CONTENT", "Turn source material into structured channel-ready content units."],
  ["03", "CANVA", "Compile approved masters with controlled copy and media fields."],
  ["04", "QA", "Check brand, readability, privacy, medical claims, and ad risk."],
  ["05", "REVIEW", "Pause only when human taste or consequential approval is required."],
  ["06", "OUTPUT", "Create derivatives and a clean publishing manifest."],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">OPUS CREATIVE WORKER / V0</p>
        <h1>Marketing should feel like routing, not drowning.</h1>
        <p className="lede">
          One production surface for social, ads, YouTube, stories, patient education, and review. The computer owns repetition. You keep taste, privacy, and paid-spend decisions.
        </p>
        <div className="statusRow">
          <span className="statusDot" />
          <span>BOOTSTRAP ACTIVE</span>
          <span className="divider">/</span>
          <span>NO AUTO-PUBLISH</span>
        </div>
      </section>

      <section className="grid">
        {lanes.map(([num, title, copy]) => (
          <article className="card" key={num}>
            <div className="cardTop">
              <span>{num}</span>
              <span className="tiny">WORKER LANE</span>
            </div>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="rail">
        <div>
          <p className="eyebrow">GOLDEN PATH</p>
          <p className="mono">SOURCE → CONTENT UNIT → CANVA MASTER → QA → REVIEW → DERIVATIVES → READY</p>
        </div>
        <div>
          <p className="eyebrow">FIRST RELEASE TARGET</p>
          <p>Thursday shoot clip → structured copy → approved Canva master → QA → review → IG + Story derivatives.</p>
        </div>
      </section>
    </main>
  );
}
