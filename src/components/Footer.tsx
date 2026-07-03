import { useEffect, useState } from "react";
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
      <div className="footrow">
        <div className="footlinks">
          <a href="/#about">Model bill</a>
          <a href="/#start">Sources</a>
          <a href="/#get-involved">Volunteer</a>
          <a href="/privacy">Privacy</a>
        </div>
        <span className="brandmini">
          <img className="glyph" src="/rti-logo-small.webp" alt="" />
        </span>
      </div>
      <p className="fine">
        Right to Intelligence · not legal advice. Every state pack is marked{" "}
        <span className="nr">source-verified draft</span> with provenance and a retrieval date where
        available.
      </p>
      {freshness && <p className="fine">{formatCivicDataFreshness(freshness)}</p>}
    </footer>
  );
}
