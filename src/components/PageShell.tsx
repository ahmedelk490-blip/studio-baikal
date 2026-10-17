import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";
import { dict, type Lang } from "@/data/i18n";

export function PageShell({ lang, dark = false, children }: { lang: Lang; dark?: boolean; children: React.ReactNode }) {
  const t = dict[lang];
  return (
    <>
      <Header t={t} lang={lang} dark={dark} />
      <main>{children}</main>
      <Footer t={t} lang={lang} />
      <WhatsAppFab label={t.contact.fab} />
    </>
  );
}