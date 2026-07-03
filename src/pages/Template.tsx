import type { ReactNode } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function Template({
  idx,
  title,
  children,
}: {
  idx: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="tpl pad">
        <p className="idx">{idx}</p>
        <h1>{title}</h1>
        <div className="body">{children}</div>
      </main>
      <Footer />
    </>
  );
}
