import { useEffect, useRef } from "react";
import { initBootNet } from "../lib/boot-net";

// The boot+sapling neural net behind the hero. Mounts the canvas, runs the engine,
// cleans up on unmount. Locked opts = the version Saint approved (182 nodes, dense).
// Pass `opts`/`className` to reuse the engine in other containers (e.g. mobile blocks).
type NetOpts = Parameters<typeof initBootNet>[1];

export default function NeuralBoot({
  className = "net",
  opts,
}: {
  className?: string;
  opts?: NetOpts;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return initBootNet(ref.current, {
      k: 3,
      connMul: 2.6,
      fill: 0.82,
      cutoff: 0.46,
      nodeScale: 1,
      lean: 30,
      ...opts,
    });
  }, [opts]);
  return <canvas className={className} aria-hidden="true" ref={ref} />;
}
