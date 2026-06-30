import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import NeuralBoot from "../components/NeuralBoot";
import Picker from "../components/Picker";
import ActionResult from "../components/ActionResult";
import { logAction, type ActionKind, type ActionLogResult } from "../lib/actions";

export default function Home() {
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
          <div className="launchstat">
            <b>50 states</b>
            <span className="statlabel">state-by-state actions with source status</span>
            <span className="liveline">
              <span className="livedot" /> every recommendation shows provenance
            </span>
          </div>
        </div>
      </header>

      <main>
        {stateKey && (
          <div ref={resultRef}>
            <ActionResult
              key={stateKey}
              stateKey={stateKey}
              onConfirm={(kind: ActionKind): Promise<ActionLogResult> => logAction(stateKey, kind)}
            />
          </div>
        )}

        <section className="beat pad" id="about">
          <div>
            <p className="idx">01 / what it is</p>
            <p className="big">Local AI is the next personal computer.</p>
            <p className="body">
              Not a chatbot account. Not a rented API. A model you can run on your own machine,
              inspect, repair, improve, and use without asking a platform to stay online. That is
              the line OII exists to protect.
            </p>
          </div>
        </section>

        <section className="beat pad" id="principles">
          <div>
            <p className="idx">02 / what we want</p>
            <p className="big">Protect lawful use. Enforce real harm.</p>
            <p className="body">
              People should be free to <b>download, own, run, study, modify, and share</b> open AI
              models. Fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes,
              discrimination, and sabotage should stay illegal and be enforced seriously. The red
              line is requiring a license just to own or run the tool.
            </p>
          </div>
        </section>

        <section className="beat pad">
          <div>
            <p className="idx">03 / local first</p>
            <p className="big">Use the computer you already own.</p>
            <p className="body">
              Not every AI task needs a warehouse of GPUs. For many everyday tasks, a small open
              model can run on a laptop, desktop, or phone people already have. Local AI will not
              replace every cloud model or training run, but the law should not force simple,
              lawful workloads back into the cloud when the task fits the device.
            </p>
          </div>
        </section>

        <section className="beat pad">
          <div>
            <p className="idx">04 / how we work</p>
            <p className="big">We show our work.</p>
            <p className="body">
              OII should not ask people to trust vibes. Each state action should show the office,
              source link, and review status behind the recommendation. If something changes, we
              update the source and the ask.
            </p>
          </div>
        </section>

        <section className="beat pad" style={{ borderBottom: "1px solid var(--line-strong)" }}>
          <div>
            <p className="idx">→ now</p>
            <p className="big">Start with your state.</p>
            <p className="body">
              Choose any state and get one useful action. State is enough to start. ZIP only matters
              when you want exact representatives.
            </p>
            <div className="endact">
              <Picker cta="Show my action →" onGo={go} />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
