import type { Metadata } from "next";
import { Fraunces, Manrope, Alexandria, Cormorant_Garamond } from "next/font/google";
import "../globals.css";
import { Smooth } from "@/components/Smooth";
import { dict, isLang, langs } from "@/data/i18n";
import { JsonLd } from "@/components/JsonLd";

const display = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT", "WONK"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
// the calm version's headline face: a straight, upright serif (no swashes), like the client's references
const calmDisplay = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-calm", display: "swap" });
const arabic = Alexandria({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600"], variable: "--font-ar", display: "swap" });

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() { return langs.map((lang) => ({ lang })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    metadataBase: new URL("https://baikalstudio.com"),
    title: { default: ar ? "استوديو بايكال | تصميم داخلي في مصر" : "Studio Baikal | Interior Design Studio in Egypt", template: ar ? "%s | استوديو بايكال" : "%s | Studio Baikal" },
    description: ar ? "استوديو بايكال يصمم مساحات داخلية وخارجية مستوحاة من الطبيعة ومبنية على الهيكل: فيلات وشقق وعيادات، باقات ثري دي وتنفيذ كامل في مصر." : "Studio Baikal designs interior and exterior spaces inspired by nature, rooted in structure. Residential, villa and clinic design, 3D packages and full execution across Egypt.",
    alternates: { canonical: `/${lang}`, languages: { en: "/en", ar: "/ar", "x-default": "/en" } },
    keywords: ar ? ["تصميم داخلي", "مصمم ديكور", "تشطيب فيلات", "تصميم شقق", "القاهرة", "الشيخ زايد", "استوديو بايكال"] : ["interior design Egypt", "interior designer Cairo", "villa interior design", "apartment design", "3D interior rendering", "Sheikh Zayed", "Studio Baikal"],
    openGraph: { title: ar ? "استوديو بايكال | حيث يلتقي التصميم بالعمق" : "Studio Baikal | Where design meets depth", images: ["/projects/october-250/01.webp"] },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en"; // never throw from the root layout
  const t = dict[lang];
  return (
    <html lang={lang} dir={t.dir} className={`${display.variable} ${sans.variable} ${arabic.variable} ${calmDisplay.variable}${process.env.NEXT_PUBLIC_HOME === "calm" ? " calm" : ""}`}>
      <body className="min-h-dvh antialiased" suppressHydrationWarning><JsonLd lang={lang} /><Smooth>{children}</Smooth></body>
    </html>
  );
}