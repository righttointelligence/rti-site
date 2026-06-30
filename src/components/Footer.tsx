export default function Footer() {
  return (
    <footer className="pad">
      <div className="footrow">
        <div className="footlinks">
          <a href="#">Model bill</a>
          <a href="#">Sources</a>
          <a href="#">Volunteer</a>
        </div>
        <span className="brandmini">
          <img className="glyph" src="/oii-logo.png" alt="" />
        </span>
      </div>
      <p className="fine">
        Open Intelligence Institute · not legal advice. Every state has a baseline action. Deeper
        state packs are marked <span className="nr">source-verified draft</span> as they are
        reviewed.
      </p>
    </footer>
  );
}
