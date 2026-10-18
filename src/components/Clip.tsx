import Image from "next/image";

/* Silent looping clip over its poster; the poster stays when the browser blocks autoplay or saves data. */
export function Clip({ src, poster, alt, className = "", sizes = "100vw", priority = false }: { src?: string; poster: string; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative "}overflow-hidden ${className}`}>
      <Image src={poster} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      {src && <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden><source src={src} type="video/mp4" /></video>}
    </div>
  );
}