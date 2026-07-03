import { Link } from "react-router-dom";
import { useSignup } from "./SignupForm";

// All navigation is SPA (Link, never a raw <a> to our own pages) — a raw
// anchor would reload the app and wipe in-memory state like scroll positions.
// "Take Action" opens the signup modal in place, wherever you are.
export default function Nav() {
  const { launch } = useSignup();
  return (
    <nav className="nav">
      <div className="row pad">
        <Link to="/" className="brandmini">
          <img className="glyph" src="/rti-logo-small.webp" alt="" />
          <span>Right to Intelligence</span>
        </Link>
        <span className="navlinks">
          <Link to="/">About</Link>
          <Link to="/stats">Stats</Link>
          <button type="button" className="navactbtn" onClick={launch}>
            Take Action
          </button>
        </span>
      </div>
    </nav>
  );
}
