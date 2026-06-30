import { Link } from "react-router-dom";
import { FsIcon } from "./icons";

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

// On the homepage the links scroll to in-page sections (exact match to the prototype).
// On other pages they route home to the matching anchor.
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
          <a href={href("take-action")}>Take Action</a>
          <button className="fsbtn" onClick={toggleFullscreen}>
            <FsIcon /> Fullscreen
          </button>
        </span>
      </div>
    </nav>
  );
}
