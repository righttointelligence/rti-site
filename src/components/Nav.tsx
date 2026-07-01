import { Link } from "react-router-dom";

// On the homepage the links scroll to in-page sections. On other pages they route
// home to the matching anchor. "Take Action" points at the hero picker.
export default function Nav({ onHome = true }: { onHome?: boolean }) {
  const href = (anchor: string) => (onHome ? `#${anchor}` : `/#${anchor}`);
  return (
    <nav className="nav">
      <div className="row pad">
        <Link to="/" className="brandmini">
          <img className="glyph" src="/oii-logo.png" alt="" />
          <span>Open Intelligence Institute</span>
        </Link>
        <span className="navlinks">
          <a href={href("about")}>About</a>
          <a href={href("principles")}>Principles</a>
          <a href={href("top")}>Take Action</a>
        </span>
      </div>
    </nav>
  );
}
