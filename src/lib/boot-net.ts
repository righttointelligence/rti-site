import { BOOT_POINTS } from "./boot-points";

// The interactive boot+sapling neural net. Node homes ARE the logo; boot nodes ink,
// leaf nodes green. Dense nearest-neighbour + distance wiring, whole-field breath,
// cursor leans nodes then they spring back, hard left wall keeps it off the text.
// initBootNet(canvas, opts) returns a cleanup fn (cancels raf + removes listeners).

type Opts = {
  k?: number;
  connMul?: number;
  fill?: number;
  cutoff?: number;
  nodeScale?: number;
  lean?: number;
  mouseR?: number;
  stiff?: number;
  damp?: number;
  /** Minimum left wall in px keeping the boot off the text. Default 560 (desktop hero).
      Set 0 for small dedicated containers so the boot fills them. */
  wallMin?: number;
  /** Minimum right margin in px. Default 220 (desktop hero). */
  wallGap?: number;
};

type Node = {
  hx: number; hy: number; x: number; y: number; vx: number; vy: number;
  ph: number; sp: number; s: number; fill: boolean; tone: number;
};

const colOf = (t: number, a: number) => {
  const v = Math.min(a, 1).toFixed(3);
  return t === 0 ? `rgba(26,26,24,${v})` : `rgba(22,163,74,${v})`;
};
const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));

export function initBootNet(canvas: HTMLCanvasElement, o: Opts = {}): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const R = o.mouseR ?? 250, K = o.k ?? 3, LEAN = o.lean ?? 30,
    STIFF = o.stiff ?? 0.13, DAMP = o.damp ?? 0.8, NS = o.nodeScale ?? 1;

  let W = 0, H = 0, BX = 0, raf = 0, t0 = 0;
  let N: Node[] = [];
  let E: [number, number][] = [];
  let mx = -1e4, my = -1e4, mOn = false;
  let scrollV = 0, lastY = window.scrollY;

  const mk = (x: number, y: number): Node => ({
    hx: x, hy: y, x, y, vx: 0, vy: 0,
    ph: Math.random() * 6.28, sp: 0.35 + Math.random() * 0.5,
    s: (Math.random() < 0.4 ? 7 : 11) * NS, fill: Math.random() < 0.42, tone: 1,
  });
  const d2 = (a: Node, b: Node) => (a.hx - b.hx) ** 2 + (a.hy - b.hy) ** 2;

  function build() {
    BX = Math.min(Math.max(W * (o.cutoff ?? 0.46), o.wallMin ?? 560), W - (o.wallGap ?? 220));
    N = []; E = [];
    const BP = BOOT_POINTS;
    const th = H * (o.fill ?? 0.8);
    let tw = th * BP.aspect;
    const maxw = (W - BX) * 0.92;
    let h = th;
    if (tw > maxw) { tw = maxw; h = tw / BP.aspect; }
    const cx = (BX + W) / 2;
    let left = cx - tw / 2;
    if (left < BX + 8) left = BX + 8;
    const top = (H - h) / 2;
    for (const P of BP.pts) {
      const nd = mk(left + P[0] * tw, top + P[1] * h);
      nd.tone = P[2];
      nd.s = (P[2] ? 8 : 7) * NS;
      N.push(nd);
    }
    // nearest-neighbour web (connected) + distance links (dense feel)
    const seen = new Set<string>();
    const addEdge = (i: number, j: number) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) { seen.add(key); E.push([i, j]); }
    };
    for (let i = 0; i < N.length; i++) {
      const ds: [number, number][] = [];
      for (let j = 0; j < N.length; j++) if (j !== i) ds.push([d2(N[i], N[j]), j]);
      ds.sort((p, q) => p[0] - q[0]);
      for (let t = 0; t < K && t < ds.length; t++) addEdge(i, ds[t][1]);
    }
    const conn = h * 0.06 * (o.connMul ?? 2.6);
    for (let i = 0; i < N.length; i++)
      for (let j = i + 1; j < N.length; j++)
        if (dist(N[i].hx, N[i].hy, N[j].hx, N[j].hy) < conn) addEdge(i, j);
  }

  function size() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function frame(ts: number) {
    if (!t0) t0 = ts;
    const el = (ts - t0) / 1000, form = Math.min(el / 1.4, 1);
    ctx!.clearRect(0, 0, W, H);
    const gx = Math.sin(el * 0.17) * 9, gy = Math.cos(el * 0.13) * 8;
    // scroll jello: the net trails the scroll then springs back; each node
    // lags a different amount so the whole field shears like jelly.
    scrollV *= 0.88;
    const jy = Math.max(-34, Math.min(34, scrollV * 0.35));
    for (const a of N) {
      const ox = Math.sin(el * a.sp + a.ph) * 6, oy = Math.cos(el * a.sp * 0.9 + a.ph) * 6;
      const jf = 0.5 + 0.5 * Math.sin(a.ph * 2.3);
      let tx = a.hx + gx + ox, ty = a.hy + gy + oy + jy * jf;
      if (mOn && !reduce) {
        const dx = mx - tx, dy = my - ty, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { const pull = (1 - d / R) * LEAN; tx += (dx / d) * pull; ty += (dy / d) * pull; }
      }
      a.vx = (a.vx + (tx - a.x) * STIFF) * DAMP;
      a.vy = (a.vy + (ty - a.y) * STIFF) * DAMP;
      a.x += a.vx; a.y += a.vy;
      if (a.x < BX) { a.x = BX; a.vx *= -0.55; }
      if (a.x > W + 30) { a.x = W + 30; a.vx *= -0.4; }
    }
    ctx!.lineWidth = 1;
    for (const [ia, ib] of E) {
      const p = N[ia], q = N[ib];
      const md = mOn ? Math.min(dist(p.x, p.y, mx, my), dist(q.x, q.y, mx, my)) : 1e4;
      const op = (md < R ? 0.18 + (1 - md / R) * 0.5 : 0.18) * form;
      const et = p.tone || q.tone ? 1 : 0;
      ctx!.strokeStyle = colOf(et, op);
      ctx!.beginPath(); ctx!.moveTo(p.x, p.y); ctx!.lineTo(q.x, q.y); ctx!.stroke();
    }
    if (mOn) {
      let best = -1, bd = 1e9;
      for (let i = 0; i < N.length; i++) { const dd = dist(N[i].x, N[i].y, mx, my); if (dd < bd) { bd = dd; best = i; } }
      if (best >= 0 && bd < R * 1.3) {
        ctx!.strokeStyle = colOf(1, 0.7 * form);
        ctx!.beginPath(); ctx!.moveTo(mx, my); ctx!.lineTo(N[best].x, N[best].y); ctx!.stroke();
      }
    }
    for (const a of N) {
      const s = a.s, near = mOn && dist(a.x, a.y, mx, my) < R;
      const al = (a.fill ? 0.52 : 0.66) * form + (near ? 0.3 : 0);
      if (a.fill) { ctx!.fillStyle = colOf(a.tone, al); ctx!.fillRect(a.x - s / 2, a.y - s / 2, s, s); }
      else { ctx!.lineWidth = 1.4; ctx!.strokeStyle = colOf(a.tone, al); ctx!.strokeRect(a.x - s / 2, a.y - s / 2, s, s); }
    }
    if (!reduce || el < 1.6) raf = requestAnimationFrame(frame);
  }

  function start() { t0 = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  function onResize() {
    // Mobile browsers fire resize when the URL bar collapses during scroll;
    // the canvas box doesn't actually change, so rebooting would reset the
    // net mid-scroll. Only rebuild on a real size change (rotation, window).
    const r = canvas.getBoundingClientRect();
    if (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1) return;
    cancelAnimationFrame(raf); size(); start();
  }
  function onScroll() {
    if (reduce) return;
    const y = window.scrollY;
    scrollV += y - lastY;
    lastY = y;
  }
  function onMove(e: MouseEvent) { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; mOn = true; }
  function onOut() { mOn = false; mx = my = -1e4; }
  function onVis() { if (document.hidden) cancelAnimationFrame(raf); else start(); }

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  // lean: 0 = fully static net; skip pointer physics (touch taps fire
  // synthetic mousemoves that warp small canvases).
  if (LEAN > 0) {
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onOut);
  }
  document.addEventListener("visibilitychange", onVis);
  size(); start();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseout", onOut);
    document.removeEventListener("visibilitychange", onVis);
  };
}
