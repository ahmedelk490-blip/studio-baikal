import Image from "next/image";
import { LoginForm } from "@/components/admin/client";
import { adminDict } from "@/lib/admin-i18n";

// Per-request admin page (session + live data): block on the server, no prerendered shell.
export const instant = false;

type Props = { params: Promise<{ lang: string }> };

export default async function Login({ params }: Props) {
  const { lang } = await params;
  const a = adminDict(lang);
  return (
    <main className="grid min-h-[100svh] place-items-center px-5 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--ink)]/10 bg-white p-8 shadow-sm">
        <Image src="/brand/logo.png" alt="Studio Baikal" width={44} height={44} className="h-11 w-11" />
        <h1 className="display mt-6 text-3xl">{a.loginTitle}</h1>
        <div className="mt-6"><LoginForm lang={lang} a={a} /></div>
      </div>
    </main>
  );
}
