import Image from "next/image";

/* Shown the instant a link is clicked, until the next page is ready. */
export default function Loading() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-[var(--deep)]">
      <Image src="/brand/logo.png" alt="" width={72} height={72} className="glow h-16 w-16 bg-[var(--surface)] p-1" />
    </div>
  );
}
