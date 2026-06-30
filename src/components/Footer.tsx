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
        Open Intelligence Institute · static prototype · not legal advice. State data is a{" "}
        <span className="nr">needs review</span> placeholder pending official verification.
      </p>
    </footer>
  );
}
