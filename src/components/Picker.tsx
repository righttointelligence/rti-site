import { useState } from "react";
import { PinIcon, ChevIcon } from "./icons";

const OPTIONS: [string, string][] = [
  ["CA", "California"],
  ["CO", "Colorado"],
  ["TX", "Texas"],
  ["OTHER", "Other state"],
];

// State dropdown + bright-green CTA. Calls onGo(stateKey) when a state is chosen.
export default function Picker({
  cta = "Take action now →",
  onGo,
}: {
  cta?: string;
  onGo: (state: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="action">
      <div className="picker">
        <span className="pin"><PinIcon /></span>
        <select
          aria-label="Choose your state"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Choose your state</option>
          {OPTIONS.map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <span className="chev"><ChevIcon /></span>
      </div>
      <button className="cta" onClick={() => (value ? onGo(value) : null)}>{cta}</button>
    </div>
  );
}
