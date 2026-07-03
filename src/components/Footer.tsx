import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCivicDataFreshness,
  formatCivicDataFreshness,
  type CivicDataFreshness,
} from "../lib/civicDataFreshness";

export default function Footer() {
  const [freshness, setFreshness] = useState<CivicDataFreshness | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCivicDataFreshness()
      .then((nextFreshness) => {
        if (!cancelled) setFreshness(nextFreshness);
      })
      .catch(() => {
        if (!cancelled) setFreshness(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="pad">
      <div className="footlinks">
        <Link to="/privacy">Privacy</Link>
      </div>
      <p className="fine">
        Right to Intelligence · not legal advice. Every state pack is marked{" "}
        <span className="nr">source-verified draft</span> with provenance and a retrieval date where
        available.
      </p>
      {freshness && <p className="fine">{formatCivicDataFreshness(freshness)}</p>}
      <img className="glyph footglyph" src="/rti-logo-small.webp" alt="" />
    </footer>
  );
}
