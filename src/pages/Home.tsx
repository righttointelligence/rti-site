import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import NeuralBoot from "../components/NeuralBoot";
import SignupForm from "../components/SignupForm";
import LiveCounter from "../components/LiveCounter";
import USMap from "../components/USMap";
import { fetchCount } from "../lib/signup";
import { useStats } from "../lib/useStats";

const BEATS = [
  {
    id: "about",
    idx: "01 / what it is",
    big: "Local AI is the next personal computer.",
    body: (
      <>
        Not a chatbot account. Not a rented API. A model you can run on your own machine, inspect,
        repair, improve, and use without asking a platform to stay online. That is the line RTI
        exists to protect.
      </>
    ),
    img: "/beats/beat-01-local.webp",
    alt: "A laptop running a small AI model locally",
    imgMax: 505,
  },
  {
    id: "principles",
    idx: "02 / what we want",
    big: "Protect lawful use. Enforce real harm.",
    body: (
      <>
        People should be free to <b>download, own, run, study, modify, and share</b> open AI models.
        Fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes, discrimination, and
        sabotage should stay illegal and be enforced seriously. The red line is requiring a license
        just to own or run the tool.
      </>
    ),
    img: "/beats/beat-02-protect.webp",
    alt: "A shield protecting a growing sprout",
  },
  {
    id: "local-first",
    idx: "03 / local first",
    big: "Use the computer you already own.",
    body: (
      <>
        Not every AI task needs a warehouse of GPUs. For many everyday tasks, a small open model can
        run on a laptop, desktop, or phone people already have. Local AI will not replace every cloud
        model or training run, but the law should not force simple, lawful workloads back into the
        cloud when the task fits the device.
      </>
    ),
    img: "/beats/beat-03-devices.webp",
    alt: "A phone and laptop running models without the cloud",
    imgMax: 505,
  },
];

// Mobile hero boot: its own full-strength stage under the CTA (workbench v2).
// lean: 0 skips pointer physics so taps never warp it. fill leaves ~50px of
// headroom around the boot inside the canvas — the breath (±14px) and scroll
// jello (±34px) excursions stay inside the render area instead of clipping.
const MOBILE_BOOT_OPTS = {
  wallMin: 0,
  wallGap: 12,
  cutoff: 0.02,
  fill: 0.67,
  nodeScale: 0.62,
  lean: 0,
};

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 820px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const on = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

// Compact US-focused live stats for the endbeat: American signatures, calls,
// and active states — the domestic fight, next to the state map.
function EndStats() {
  const stats = useStats();
  if (!stats) return null;
  let signups = 0;
  let calls = 0;
  let active = 0;
  for (const s of Object.values(stats.states)) {
    signups += s.signups;
    calls += s.calls;
    if (s.signups + s.calls > 0) active += 1;
  }
  return (
    <div className="endstats" aria-label="Live United States stats">
      <div className="endstat">
        <b>{signups.toLocaleString("en-US")}</b>
        <span>US signatures</span>
      </div>
      <div className="endstat">
        <b>{calls.toLocaleString("en-US")}</b>
        <span>calls logged</span>
      </div>
      <div className="endstat">
        <b>{active}</b>
        <span>states active</span>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCount().then((n) => {
      if (alive && n !== null) setTotal(n);
    });
    // Fresh totals broadcast by the signup modal (which lives at App level).
    const onTotal = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      if (alive && typeof n === "number") setTotal(n);
    };
    window.addEventListener("rti:total", onTotal);
    return () => {
      alive = false;
      window.removeEventListener("rti:total", onTotal);
    };
  }, []);

  return (
    <>
      <Nav />

      <header className="hero pad" id="top">
        {!isMobile && <NeuralBoot />}
        <div className="heroinner">
          <h1>Protect your right to run local&nbsp;AI.</h1>
          <div className="divider" />
          <p className="subcopy">
            New state laws could put local AI behind a license — turning open models into something
            you need permission to use.{" "}
            <b>Signing takes ten seconds. If you're down to do more, we've got a call script ready.</b>
          </p>
          <SignupForm />
          {isMobile && (
            <div className="heroboot" aria-hidden="true">
              <NeuralBoot className="herobootnet" opts={MOBILE_BOOT_OPTS} />
            </div>
          )}
          <LiveCounter total={total} onTotal={setTotal} />
        </div>
      </header>

      <main>
        {BEATS.map((b, i) => (
          <section className="beat pad" id={b.id} key={b.id}>
            <div className={`beatgrid${i % 2 === 1 ? " alt" : ""}`}>
              <div className="beattext">
                <p className="idx">{b.idx}</p>
                <p className="big">{b.big}</p>
                <p className="body">{b.body}</p>
              </div>
              <figure className="beatfig">
                <img
                  src={b.img}
                  alt={b.alt}
                  loading="lazy"
                  style={{ "--imgmax": `${b.imgMax ?? 400}px` } as React.CSSProperties}
                />
              </figure>
            </div>
          </section>
        ))}

        <section className="beat pad endbeat" id="start">
          <div className="endgrid">
            <div className="endtext">
              <p className="idx">→ now</p>
              <p className="big">Start with your state.</p>
              <p className="body">
                Choose any state and get one useful call script. State is enough to start. The
                official lookup may ask for your address to find exact legislators; RTI does not
                store it.
              </p>
              <EndStats />
              <div className="endact">
                <SignupForm />
              </div>
            </div>
            <figure className="endmap">
              <USMap />
            </figure>
          </div>
        </section>

        <section className="getinvolved pad" id="get-involved">
          <div className="giveinner">
            <p className="idx">→ get involved</p>
            <p className="big">Want to do more than call?</p>
            <p className="body">
              Follow the people building this in the open. If you want to help with research,
              outreach, data, or the site, reach out directly.
            </p>
            <div className="involverow">
              <a href="https://x.com/kingbootoshi" rel="noreferrer" target="_blank">@kingbootoshi</a>
              <a href="https://x.com/0xSero" rel="noreferrer" target="_blank">@0xSero</a>
              <a href="https://x.com/RayFernando1337" rel="noreferrer" target="_blank">@RayFernando1337</a>
            </div>
            <a className="involvecta" href="mailto:volunteer@righttointelligence.org?subject=Right%20to%20Intelligence">
              volunteer@righttointelligence.org →
            </a>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
