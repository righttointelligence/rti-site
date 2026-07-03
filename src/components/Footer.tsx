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
      <div className="footrow">
        <div className="footlinks">
          <Link to="/#about">Model bill</Link>
          <Link to="/#start">Sources</Link>
          <Link to="/#get-involved">Volunteer</Link>
          <Link to="/privacy">Privacy</Link>
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
