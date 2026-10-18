"use client";
import { usePathname } from "next/navigation";

/* The deep-water page curtain for the public site; the admin changes pages without it. */
export function Curtain() {
  const path = usePathname() ?? "";
  return /^\/(en|ar)\/admin(\/|$)/.test(path) ? null : <div aria-hidden className="page-curtain" />;
}
