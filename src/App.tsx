import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./pages/Template";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/about"
          element={
            <Template idx="01 / about" title="Local AI is the next personal computer.">
              <p>
                Not a chatbot account. Not a rented API. A model you can run on your own machine,
                inspect, repair, improve, and use without asking a platform to stay online.
              </p>
              <p>That is the line OII exists to protect.</p>
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
                OII does not need your name, address, or exact location to show the first action.
              </p>
            </Template>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
