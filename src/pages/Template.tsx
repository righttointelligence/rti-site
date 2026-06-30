import Nav from "../components/Nav";
import Footer from "../components/Footer";

// Shared scaffold for the pages we fill in later (About, Principles, Take Action).
// Same shell, typography, and spacing as the homepage — content goes here next.
export default function Template({ idx, title }: { idx: string; title: string }) {
  return (
    <>
      <Nav onHome={false} />
      <main className="tpl pad">
        <p className="idx">{idx}</p>
        <h1>{title}</h1>
        <p className="body">Template coming. We'll fill this page in next.</p>
      </main>
      <Footer />
    </>
  );
}
