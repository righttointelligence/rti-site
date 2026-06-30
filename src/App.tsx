import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Template from "./pages/Template";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Template pages — content filled in later */}
        <Route path="/about" element={<Template idx="01 / about" title="About the Institute." />} />
        <Route path="/principles" element={<Template idx="02 / principles" title="What we stand for." />} />
        <Route path="/take-action" element={<Template idx="→ take action" title="Take the action." />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
