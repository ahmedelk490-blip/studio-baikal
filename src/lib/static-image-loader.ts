/* Image loader for the static (PHP/HTML host) build. next/image cannot resize on a plain host, so the
   static build writes two smaller copies of every project photo beside the original (scripts/build-static.mjs:
   NN.w480.webp and NN.w960.webp) and this picks the smallest copy that is still wider than the slot. Every
   other asset (brand, frames) is served as is. */
export default function loader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/projects/") || !src.endsWith(".webp") || /\.w\d+\.webp$/.test(src)) return src;
  const w = width <= 480 ? 480 : width <= 960 ? 960 : 0;
  return w ? src.replace(/\.webp$/, `.w${w}.webp`) : src;
}
