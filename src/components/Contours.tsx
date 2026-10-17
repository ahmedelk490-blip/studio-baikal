/* Motion graphic from the brand key visual: gold contour lines that draw themselves, then flow
   sideways forever (transform-only, seamless: each path spans two periods of 1200 units). */
const W = 1200;
function wave(i: number) {
  const base = 40 + i * 45, amp = 14 + (i % 3) * 8, ph = i * 0.9;
  let d = "";
  for (let x = 0; x <= 2 * W; x += 20) {
    const y = base + amp * Math.sin((2 * Math.PI * x) / W + ph) + amp * 0.35 * Math.sin((4 * Math.PI * x) / W + ph * 1.7);
    d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
  }
  return d;
}
const paths = Array.from({ length: 7 }, (_, i) => wave(i));

export function Contours({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 1200 360" preserveAspectRatio="none">
      <g className="ct-flow">{paths.map((d, i) => <path key={i} d={d} pathLength={1} className="ct-line" style={{ animationDelay: `${i * 0.15}s` }} />)}</g>
    </svg>
  );
}