"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Preloader() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("bk-intro") === "1"; sessionStorage.setItem("bk-intro", "1"); } catch {}
    if (seen) { setGone(true); return; }
    const t = setTimeout(() => setGone(true), 2400);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div className="preloader" aria-hidden>
      <div className="preloader-mark text-[var(--surface)]">
        <Image src="/brand/logo.png" alt="" width={96} height={96} priority className="h-20 w-20 md:h-24 md:w-24" />
        <p className="mt-5 text-xs uppercase tracking-[0.3em] rtl:tracking-normal opacity-70">Descending</p>
      </div>
    </div>
  );
}