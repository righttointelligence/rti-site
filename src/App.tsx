import { lazy, Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Action from "./pages/Action";
import Stats from "./pages/Stats";
import Template from "./pages/Template";
import Privacy from "./pages/Privacy";

// Every page is a synchronous import: navigation renders instantly, no
// suspense flash. The one heavy asset — the world map's ~120KB of geometry —
// is data, not a page, and Stats lazy-loads it in the background on mount.

// Dev-only design workbench; stripped from production builds.
const Workbench = import.meta.env.DEV ? lazy(() => import("./pages/Workbench")) : null;

// Every navigation lands at the top of the new page, instantly. The browser's
// own history scroll restoration is switched off — otherwise back/forward
// re-scrolls to the old position and fights this. Hash links (/#start) still
// anchor-scroll. useLayoutEffect runs before paint, so the old scroll position
// is never visible for even a frame.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        {Workbench ? (
          <Route
            path="/workbench"
            element={
              <Suspense fallback={null}>
                <Workbench />
              </Suspense>
            }
          />
        ) : null}
        <Route path="/action/:slug" element={<Action />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/about"
          element={
            <Template idx="01 / about" title="Local AI is the next personal computer.">
              <p>
                Not a chatbot account. Not a rented API. A model you can run on your own machine,
                inspect, repair, improve, and use without asking a platform to stay online.
              </p>
              <p>That is the line RTI exists to protect.</p>
            </Template>
          }
        />
        <Route
          path="/principles"
          element={
            <Template idx="02 / principles" title="Protect lawful use. Enforce real harm.">
              <p>
                People should be free to download, own, run, study, modify, and share open AI
                models.
              </p>
              <p>
                Fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes,
                discrimination, and sabotage should stay illegal and be enforced seriously.
              </p>
              <p>The red line is requiring a license just to own or run the tool.</p>
            </Template>
          }
        />
        <Route
          path="/take-action"
          element={
            <Template idx="→ take action" title="Start with your state.">
              <p>
                Choose any state from the homepage and get one useful action. Every state now has a
                source-verified draft pack with official routes, provenance, and a plain-English ask.
              </p>
              <p>
                RTI does not need your name, address, or exact location to show the first action.
              </p>
            </Template>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
