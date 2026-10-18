import { getContact } from "@/lib/site";

/* Organization + LocalBusiness so Google can show the studio card; FAQ/Breadcrumb are added per page. */
export async function JsonLd({ lang, extra }: { lang: "en" | "ar"; extra?: object[] }) {
  const contact = await getContact(lang);
  const org = {
    "@context": "https://schema.org", "@type": ["InteriorDesignService", "LocalBusiness"], "@id": "https://baikalstudio.com/#studio",
    name: lang === "ar" ? "استوديو بايكال" : "Studio Baikal", url: `https://baikalstudio.com/${lang}`, logo: "https://baikalstudio.com/brand/logo.png", image: "https://baikalstudio.com/projects/october-250/01.webp",
    description: lang === "ar" ? "استوديو تصميم داخلي في مصر: فيلات وشقق وعيادات، باقات ثري دي وتنفيذ كامل." : "Interior design studio in Egypt: villas, apartments and clinics, 3D packages and full execution.",
    telephone: contact.phone, email: contact.email, sameAs: [contact.instagram], areaServed: ["Cairo", "Giza", "Sheikh Zayed", "6th of October", "Alexandria", "Egypt"],
    address: { "@type": "PostalAddress", addressCountry: "EG", addressLocality: "Cairo" }, founder: lang === "ar" ? "شقيقتان" : "Two sisters", slogan: "Where design meets depth",
  };
  return <>{[org, ...(extra ?? [])].map((o, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />)}</>;
}