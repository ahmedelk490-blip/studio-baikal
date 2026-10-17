import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Smooth } from "@/components/Smooth";

const display = Fraunces({ subsets: ["latin"], axes: ["opsz", "SOFT", "WONK"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://baikalstudio.com"),
  title: { default: "Studio Baikal | Interior Design Studio in Egypt", template: "%s | Studio Baikal" },
  description: "Studio Baikal designs interior and exterior spaces inspired by nature, rooted in structure. Residential, villa and clinic design, 3D packages and full execution across Egypt.",
  openGraph: { title: "Studio Baikal | Where design meets depth", description: "Interior & exterior spaces inspired by nature, rooted in structure.", images: ["/projects/october-250/01.webp"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased"><Smooth>{children}</Smooth></body>
    </html>
  );
}