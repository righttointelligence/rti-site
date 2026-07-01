import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import NeuralBoot from "../components/NeuralBoot";
import Picker from "../components/Picker";
import USMap from "../components/USMap";
import { slugForAbbr } from "../lib/stateSlug";

const BEATS = [
  {
    id: "about",
    idx: "01 / what it is",
    big: "Local AI is the next personal computer.",
    body: (
      <>
        Not a chatbot account. Not a rented API. A model you can run on your own machine, inspect,
        repair, improve, and use without asking a platform to stay online. That is the line OII
        exists to protect.
      </>
    ),
    img: "/beats/beat-01-local.png",
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
    img: "/beats/beat-02-protect.png",
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
    img: "/beats/beat-03-devices.png",
    alt: "A phone and laptop running models without the cloud",
    imgMax: 505,
  },
  {
    id: "how-we-work",
    idx: "04 / how we work",
    big: "Every claim has a receipt.",
    body: (
      <>
        We don't ask you to take our word for it. Every state action links the exact office you're
        contacting and the public record behind it — the bill, its status, and the date we checked.
        When the facts change, we update the action.
      </>
    ),
    img: "/beats/beat-04-sources.png",
    alt: "A sourced document with a green check",
    imgMax: 505,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const go = (abbr: string) => navigate(`/action/${slugForAbbr(abbr)}`);

  // reveal the manifesto beats on scroll (matches the prototype)
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion:no-preference)").matches) {
      document.querySelectorAll(".beat").forEach((b) => b.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.18 }
    );
    document.querySelectorAll(".beat").forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

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
            you need permission to use.{" "}
            <b>Choose your state. Find exact offices. Read the script. Log the call.</b>
          </p>
          <Picker onGo={go} />
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
                <img src={b.img} alt={b.alt} loading="lazy" style={{ maxWidth: b.imgMax ?? 400 }} />
              </figure>
            </div>
          </section>
        ))}

        <section className="beat pad endbeat">
          <div className="endgrid">
            <div className="endtext">
              <p className="idx">→ now</p>
              <p className="big">Start with your state.</p>
              <p className="body">
                Choose any state and get one useful call script. State is enough to start. The
                official lookup may ask for your address to find exact legislators; OII does not
                store it.
              </p>
              <div className="endact">
                <Picker cta="Show my action →" onGo={go} />
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
            <a className="involvecta" href="mailto:bootoshi@axia.agency?subject=Open%20Intelligence%20Institute">
              bootoshi@axia.agency →
            </a>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
