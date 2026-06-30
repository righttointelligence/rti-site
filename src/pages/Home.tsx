import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import NeuralBoot from "../components/NeuralBoot";
import Picker from "../components/Picker";
import ActionResult from "../components/ActionResult";
import CountUp from "../components/CountUp";

const SEED = 12480;

export default function Home() {
  const [count, setCount] = useState(SEED);
  const [stateKey, setStateKey] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // reveal the manifesto beats on scroll (matches the prototype)
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion:no-preference)").matches) {
      document.querySelectorAll(".beat").forEach((b) => b.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.22 }
    );
    document.querySelectorAll(".beat").forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [stateKey]);

  const go = (s: string) => {
    setStateKey(s);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  return (
    <>
      <Nav />

      <header className="hero pad" id="top">
        <NeuralBoot />
        <div className="heroinner">
          <h1>Protect your right to run local&nbsp;AI.</h1>
          <div className="divider" />
          <p className="subcopy">
            New state laws could put local AI behind a license — turning open models into something
            you need permission to use. <b>Take a 2-minute action to protect your rights.</b>
          </p>
          <Picker onGo={go} />
          <div className="bigstat">
            <CountUp value={count} />
            <span className="statlabel">people have taken action</span>
            <span className="liveline">
              <span className="livedot" /> live count — every action counts
            </span>
          </div>
        </div>
      </header>

      <main>
        {stateKey && (
          <div ref={resultRef}>
            <ActionResult stateKey={stateKey} rank={count + 1} onConfirm={() => setCount((c) => c + 1)} />
          </div>
        )}

        <section className="beat pad" id="about">
          <div>
            <p className="idx">01 / what it is</p>
            <p className="big">You can run AI on your own computer.</p>
            <p className="body">
              No account. No subscription. No permission. It works offline, it stays private, and
              nobody can change the rules or switch it off later. That only stays true if the law
              protects it.
            </p>
          </div>
        </section>

        <section className="beat pad" id="principles">
          <div>
            <p className="idx">02 / what we want</p>
            <p className="big">Punish the crime. Not the tool.</p>
            <p className="body">
              You should be free to <b>download, run, change, and share</b> open models. Real harm —{" "}
              <b>fraud, harassment, abuse</b> — should stay illegal. Go after the people who do it,
              not everyone who runs the software.
            </p>
          </div>
        </section>

        <section className="beat pad">
          <div>
            <p className="idx">03 / how we work</p>
            <p className="big">Every claim shows its source.</p>
            <p className="body">
              Each fact links to where it came from and the day we checked it. Anything we haven't
              confirmed yet is marked <span className="nr">needs review</span>. We'd rather show what
              we don't know than fake it.
            </p>
          </div>
        </section>

        <section className="beat pad" style={{ borderBottom: "1px solid var(--line-strong)" }}>
          <div>
            <p className="idx">→ now</p>
            <p className="big">Take the action.</p>
            <div className="endact">
              <Picker cta="Get my action →" onGo={go} />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
