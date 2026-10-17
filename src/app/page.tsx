import { Header } from "@/components/Header";
import { Preloader } from "@/components/Preloader";
import { DepthGauge } from "@/components/DepthGauge";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Strata } from "@/components/Strata";
import { Rooms } from "@/components/Rooms";
import { Services } from "@/components/Services";
import { Materials } from "@/components/Materials";
import { Approach } from "@/components/Approach";
import { Studio } from "@/components/Studio";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <>
      <Preloader />
      <DepthGauge />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <div className="grain">
          <Strata projects={projects} />
          <Rooms />
          <Services />
          <Materials />
          <Approach />
          <Studio />
          <Contact />
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}