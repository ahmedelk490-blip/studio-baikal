import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DepthGauge } from "@/components/DepthGauge";
import { Hero } from "@/components/Hero";
import { HeroLight } from "@/components/HeroLight";
import { HeroBeam } from "@/components/HeroBeam";
import { HeroModel } from "@/components/HeroModel";
import { Manifesto } from "@/components/Manifesto";
import { Services } from "@/components/Services";
import { LitByDegrees } from "@/components/LitByDegrees";
import { Studio } from "@/components/Studio";
import { MirrorHall } from "@/components/MirrorHall";
import { Colonnade } from "@/components/Colonnade";
import { HeroV2, ProjectIndex, MaterialExplorer, DetailReveal, ChapterRail } from "@/components/v2/HomeV2";
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
  // second home version (npm run dev:v2 on :3910): editorial and light, no video or WebGL
  if (process.env.NEXT_PUBLIC_HOME === "v2") {
    return (
      <>
        <Header t={t} lang={lang} dark />
        <ChapterRail lang={lang} />
        <main>
          <HeroV2 t={t} lang={lang} />
          <ProjectIndex projects={list} t={t} lang={lang} />
          <MaterialExplorer t={t} lang={lang} />
          <DetailReveal projects={list} lang={lang} />
          <Studio t={t} />
          <Contact t={t} contact={await getContact(lang)} />
        </main>
        <Footer t={t} lang={lang} />
        <WhatsAppFab label={t.contact.fab} lang={lang} />
      </>
    );
  }
  return (
    <>
      <DepthGauge />
      <Header t={t} lang={lang} dark />
      <main>
        {/* the opening (mark to header, column of light to arch to full film); NEXT_PUBLIC_HERO=arch|light
            still serves the earlier heroes for comparing */}
        {process.env.NEXT_PUBLIC_HERO === "arch" ? <Hero t={t} lang={lang} /> : process.env.NEXT_PUBLIC_HERO === "light" ? <HeroLight t={t} lang={lang} /> : process.env.NEXT_PUBLIC_HERO === "beam" ? <HeroBeam t={t} lang={lang} /> : <HeroModel t={t} lang={lang} />}
        <Manifesto t={t} />
        {/* eight rooms, each with its own ground, layout and motion */}
        <MirrorHall projects={list} t={t} lang={lang} />
        <div className="grain">
          <LitByDegrees t={t} />
          <Services t={t} lang={lang} />
          <Colonnade t={t} />
          <Studio t={t} />
          <Contact t={t} contact={await getContact(lang)} />
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <WhatsAppFab label={t.contact.fab} lang={lang} />
    </>
  );
}