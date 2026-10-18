import type { Metadata } from "next";

/* The admin lives beside the public site but looks nothing like it: plain ivory panels, no motion,
   and never indexed by search engines. */
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
// Admin pages are per-request (session, live data): let them block on the server instead of prerendering a shell.
export const instant = false;

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100svh] bg-[#F6F4EF] text-[var(--ink)]">{children}</div>;
}
