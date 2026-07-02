import { useState, type ReactElement } from "react";
import NeuralBoot from "../components/NeuralBoot";

// ---------------------------------------------------------------------------
// Dev-only workbench: 5 mobile hero treatments for the RTI boot neural net.
// View at phone width (393px) — each variant is a full-screen hero replica
// using the REAL hero classes + the REAL canvas engine. Route is stripped
// from production builds (registered under import.meta.env.DEV in App.tsx).
// ---------------------------------------------------------------------------

// Small-container engine opts: no desktop left wall, boot fills the box.
const BLOCK_OPTS = { wallMin: 0, wallGap: 12, cutoff: 0.02, fill: 0.9, nodeScale: 0.62 };
const CORNER_OPTS = { wallMin: 0, wallGap: 8, cutoff: 0.1, fill: 0.94, nodeScale: 0.7 };

type V = { id: string; title: string; note: string; render: () => ReactElement };

function HeroCopy() {
  return (
    <>
      <h1>Protect your right to run local&nbsp;AI.</h1>
      <div className="divider" />
      <p className="subcopy">
        New state laws could put local AI behind a license — turning open models into something
        you need permission to use.{" "}
        <b>Choose your state. Find exact offices. Read the script. Log the call.</b>
      </p>
    </>
  );
}

function HeroCta() {
  return (
    <div className="action">
      <div className="picker">
        <select defaultValue="">
          <option value="" disabled>
            Choose your state
          </option>
          <option>California</option>
        </select>
      </div>
      <button className="cta" type="button">
        Take action now →
      </button>
    </div>
  );
}

const VARIANTS: V[] = [
  {
    id: "v1",
    title: "v1 — whisper (shipped today)",
    note: "Boot stays behind the text, ghosted to 22%. Quietest option; boot reads as texture.",
    render: () => (
      <header className="hero pad wb-hero">
        <NeuralBoot className="net wb-whisper" />
        <div className="heroinner">
          <HeroCopy />
          <HeroCta />
        </div>
      </header>
    ),
  },
  {
    id: "v2",
    title: "v2 — boot block between copy and CTA",
    note: "Boot gets its own full-strength stage between the subcopy and the buttons. Zero collision, boot stays a star.",
    render: () => (
      <header className="hero pad wb-hero">
        <div className="heroinner">
          <HeroCopy />
          <div className="wb-block">
            <NeuralBoot className="wb-blocknet" opts={BLOCK_OPTS} />
          </div>
          <HeroCta />
        </div>
      </header>
    ),
  },
  {
    id: "v3",
    title: "v3 — crest above the headline",
    note: "Boot as a mark/mascot crowning the hero, like a masthead. Bold brand-forward open.",
    render: () => (
      <header className="hero pad wb-hero">
        <div className="heroinner">
          <div className="wb-crest">
            <NeuralBoot className="wb-blocknet" opts={BLOCK_OPTS} />
          </div>
          <HeroCopy />
          <HeroCta />
        </div>
      </header>
    ),
  },
  {
    id: "v4",
    title: "v4 — anchored bottom, under the CTA",
    note: "Text and buttons own the top; boot rises full-strength from below the fold line, fading upward.",
    render: () => (
      <header className="hero pad wb-hero wb-bottomhero">
        <div className="heroinner">
          <HeroCopy />
          <HeroCta />
        </div>
        <div className="wb-bottom">
          <NeuralBoot className="wb-blocknet wb-fadeup" opts={CORNER_OPTS} />
        </div>
      </header>
    ),
  },
  {
    id: "v5",
    title: "v5 — full-bleed watermark",
    note: "Giant boot at 8% behind everything, centered. Feels like a letterhead; maximum calm.",
    render: () => (
      <header className="hero pad wb-hero">
        <NeuralBoot
          className="net wb-watermark"
          opts={{ wallMin: 0, wallGap: 0, cutoff: 0.02, fill: 0.95 }}
        />
        <div className="heroinner">
          <HeroCopy />
          <HeroCta />
        </div>
      </header>
    ),
  },
];

export default function Workbench() {
  const [active, setActive] = useState(0);
  const v = VARIANTS[active];
  return (
    <div className="wb">
      <style>{`
        .wb { min-height: 100svh; background: var(--paper); }
        .wbbar {
          position: sticky; top: 0; z-index: 40; display: flex; gap: 6px;
          align-items: center; flex-wrap: wrap; padding: 10px var(--pad);
          background: rgba(252,252,251,.95); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
        }
        .wbbar button {
          font-family: var(--mono); font-size: 12px; padding: 6px 10px;
          border: 1px solid var(--line); background: #fff; cursor: pointer;
        }
        .wbbar button.on { border-color: var(--accent); color: var(--accent); font-weight: 700; }
        .wbnote { font-size: 12px; color: var(--faint); padding: 10px var(--pad) 0; line-height: 1.5; }
        .wb-hero { min-height: calc(100svh - 96px); }
        .wb-whisper { opacity: .22; -webkit-mask-image: linear-gradient(to left,#000 30%,transparent 75%); mask-image: linear-gradient(to left,#000 30%,transparent 75%); }
        .wb-block { position: relative; height: 236px; margin: 6px 0 26px; }
        .wb-crest { position: relative; height: 168px; margin: 0 0 18px; }
        .wb-blocknet { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; display: block; }
        .wb-bottomhero { justify-content: flex-start; padding-top: 28px; }
        .wb-bottom { position: relative; height: 300px; margin-top: 26px; width: 100%; }
        .wb-fadeup { -webkit-mask-image: linear-gradient(to top,#000 62%,transparent 100%); mask-image: linear-gradient(to top,#000 62%,transparent 100%); }
        .wb-watermark { opacity: .08; -webkit-mask-image: none; mask-image: none; }
      `}</style>
      <div className="wbbar">
        {VARIANTS.map((x, i) => (
          <button key={x.id} className={i === active ? "on" : ""} onClick={() => setActive(i)}>
            {x.id}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "var(--gray)" }}>{v.title}</span>
      </div>
      <p className="wbnote">{v.note}</p>
      {/* remount canvas per variant so the engine rebuilds for the new container */}
      <div key={v.id}>{v.render()}</div>
    </div>
  );
}
