import Image from "next/image";

/* Shown the instant a link is clicked, until the next page is ready. */
export default function Loading() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-[var(--deep)]">
      {/* the calm look shows the mark itself, light on the dark, never on a white tile */}
      {process.env.NEXT_PUBLIC_HOME === "calm"
        ? <Image src="/brand/logo-light.png" alt="" width={72} height={72} className="glow h-16 w-16" />
        : <Image src="/brand/logo.png" alt="" width={72} height={72} className="glow h-16 w-16 bg-[var(--surface)] p-1" />}
    </div>
  );
}
