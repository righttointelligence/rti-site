export default function Footer() {
  return (
    <footer className="pad">
      <div className="footrow">
        <div className="footlinks">
          <a href="/#about">Model bill</a>
          <a href="/#how-we-work">Sources</a>
          <a href="/#get-involved">Volunteer</a>
        </div>
        <span className="brandmini">
          <img className="glyph" src="/oii-logo.png" alt="" />
        </span>
      </div>
      <p className="fine">
        Open Intelligence Institute · not legal advice. Every state pack is marked{" "}
        <span className="nr">source-verified draft</span> with provenance and a retrieval date where
        available.
      </p>
    </footer>
  );
}
