import type { Lang } from "./i18n";

/* Copy for the layered-build board, the growing frame, the closing invitation and the hero's
   second line (the film's own story: drawn, then built). */
export type Layer = { name: string; note: string };
export type Extras = {
  layers: { eyebrow: string; title: string; intro: string; items: Layer[] };
  grow: { eyebrow: string; line: string };
  cta: { eyebrow: string; title: string; note: string; btn: string };
  heroAlt: [string, string];
  heroChip: string;
  explore: string;
};

export const extras: Record<Lang, Extras> = {
  en: {
    layers: {
      eyebrow: "Built in layers",
      title: "What sits behind the finish",
      intro: "Every room we hand over is built from the slab up. This is what goes into a Baikal wall before you ever see it.",
      items: [
        { name: "Finish", note: "Walnut, travertine or paint: the surface you touch every day" },
        { name: "Plaster & skim", note: "Level, crack-free walls, so the finish sits true" },
        { name: "Services", note: "Power, plumbing and lighting runs, planned before a wall is closed" },
        { name: "Insulation", note: "Sound and heat kept where they belong" },
        { name: "Structure", note: "The slab and the walls, checked and corrected first" },
      ],
    },
    grow: { eyebrow: "El Nakhil Villa · New Cairo", line: "A room should feel like it was always there" },
    cta: { eyebrow: "Your space", title: "Ready to shape your space?", note: "Tell us about the place. We call you back within one working day, and the first consultation is free.", btn: "Book a free consultation" },
    heroAlt: ["Drawn with care,", "built to last"],
    heroChip: "Free first consultation · we reply within one working day",
    explore: "Explore all projects",
  },
  ar: {
    layers: {
      eyebrow: "طبقة فوق طبقة",
      title: "ما وراء التشطيب",
      intro: "كل مساحة نسلّمها تُبنى من الأساس. هذا ما يدخل في حائط بايكال قبل أن تراه",
      items: [
        { name: "التشطيب النهائي", note: "خشب جوز أو ترافرتين أو دهان: السطح الذي تلمسه كل يوم" },
        { name: "المحارة والمعجون", note: "حوائط مستوية بلا شروخ، ليستقر التشطيب في مكانه" },
        { name: "التأسيسات", note: "كهرباء وسباكة وإضاءة مخطّطة قبل أن يُغلق أي حائط" },
        { name: "العزل", note: "عزل للصوت والحرارة يحفظ هدوء المكان" },
        { name: "الهيكل", note: "البلاطة والحوائط تُفحص وتُضبط أولًا" },
      ],
    },
    grow: { eyebrow: "فيلا النخيل · القاهرة الجديدة", line: "الغرفة الجيدة تبدو وكأنها كانت هنا دائمًا" },
    cta: { eyebrow: "مساحتك", title: "جاهز نصمم مساحتك؟", note: "احكِ لنا عن المكان، ونتصل بك خلال يوم عمل واحد. الاستشارة الأولى مجانية", btn: "احجز استشارة مجانية" },
    heroAlt: ["نرسمها بعناية،", "ونبنيها لتدوم"],
    heroChip: "استشارة أولى مجانية · نرد خلال يوم عمل",
    explore: "استكشف كل المشاريع",
  },
};
