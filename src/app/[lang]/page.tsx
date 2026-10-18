import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Preloader } from "@/components/Preloader";
import { DepthGauge } from "@/components/DepthGauge";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Strata } from "@/components/Strata";
import { Featured } from "@/components/Featured";
import { Rooms } from "@/components/Rooms";
import { Services } from "@/components/Services";
import { Configurator } from "@/components/Configurator";
import { DrawnToBuilt } from "@/components/DrawnToBuilt";
import { LitByDegrees } from "@/components/LitByDegrees";
import { pages } from "@/data/pages";
import { Materials } from "@/components/Materials";
import { Approach } from "@/components/Approach";
import { Studio } from "@/components/Studio";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { listProjects } from "@/lib/content";
import { getContact, withSeo } from "@/lib/site";
import { dict, isLang } from "@/data/i18n";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? withSeo("home", lang, {}) : {};
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict[lang];
  const list = await listProjects(lang);
  return (
    <>
      <Preloader label={t.preloader} />
      <DepthGauge />
      <Header t={t} lang={lang} dark />
      <main>
        <Hero t={t} lang={lang} />
        <Manifesto t={t} />
        <div className="grain">
          <Strata projects={list} t={t} lang={lang} />
        </div>
        <Featured projects={list} t={t} lang={lang} />
        <div className="grain">
          <LitByDegrees t={t} />
          <Rooms t={t} />
          <Services t={t} lang={lang} />
          <Configurator c={pages[lang].config} />
          <Materials t={t} />
          <DrawnToBuilt t={t} />
          <Approach t={t} />
          <Studio t={t} />
          <Contact t={t} contact={await getContact(lang)} />
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <WhatsAppFab label={t.contact.fab} lang={lang} />
    </>
  );
}