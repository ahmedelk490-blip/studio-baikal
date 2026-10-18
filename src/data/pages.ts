import type { Lang } from "./i18n";

const en = {
  nav: { home: "Home", projects: "Projects", services: "Services", studio: "Studio", contact: "Contact" },
  projects: {
    eyebrow: "Project archive", title: "Every home, every room.", view: "Step inside", all: "All",
    intro: "Villas, apartments and a clinic across Cairo, Giza and Sheikh Zayed. Filter by type, then step inside.",
    filters: { Villa: "Villas", Apartment: "Apartments", Clinic: "Clinics" } as Record<string, string>,
  },
  services: {
    eyebrow: "Services & packages", title: "From drawing to doorstep.", drawing: "Drawing", render: "Finished", forLabel: "Best for", included: "What you get", cta: "Book a free consultation",
    intro: "Drag the line, or watch it move: every Baikal room starts as a precise drawing and ends as a finished space.",
    packages: [
      { name: "3D Design Package", for: "Owners who want to see every room before building.", items: ["Measured survey of the space", "Furniture layout and 2D plans", "Material and colour board", "Photoreal 3D renders of every room", "360° virtual tour", "Technical drawings for any contractor"] },
      { name: "Design & Execution", for: "Owners who want one team from first sketch to handover.", items: ["Everything in the 3D package", "Contractor selection and coordination", "Regular site supervision", "Sourcing of furniture and lighting", "Snag list and final styling", "Handover with a care guide"] },
    ],
    faqTitle: "Questions we hear often",
    faq: [
      ["How long does a project take?", "It depends on the size of the space and the number of revisions. We agree a clear timeline in the proposal before we start."],
      ["Do you work outside Cairo?", "Yes. We design across Egypt, including Alexandria, and work remotely with clients abroad."],
      ["Can I start with design and build later?", "Yes. The 3D package includes full technical drawings, so any contractor can build from it, or we can join for execution later."],
      ["How do I get a quote?", "Book a free consultation. We ask about the space and what you need, then send a clear proposal."],
    ] as [string, string][],
  },
  studio: {
    eyebrow: "The studio", title: "Two sisters, one calm language.", valuesTitle: "What we hold on to", cta: "Start your project",
    intro: "Studio Baikal is named after the deepest lake on earth: still on the surface, full of structure below.",
    chapters: [
      ["Our story", "Studio Baikal believes great design is more than beautiful spaces. It is about creating environments that reflect the people who live in them, inspired by the depth, balance and tranquillity of nature."],
      ["Our approach", "Every project is approached with thoughtful planning, attention to detail and a deep understanding of our clients' vision. We create spaces that feel personal, refined and built to last."],
      ["Our values", "Timeless design, thoughtful details and a personal approach: interiors that stay elegant beyond trends, where every element is considered and tailored to the way you live."],
    ] as [string, string][],
  },
  config: {
    eyebrow: "Choose your palette", title: "One kitchen, your materials.", room: "Kitchen",
    intro: "Pick a palette and watch cabinetry, stone and trim change together. Every Baikal project starts from a board like this.",
    fields: ["Cabinetry", "Stone", "Trim", "Lighting"],
    options: [
      { name: "Walnut & Granite", spec: ["Walnut and matte white", "Black granite", "Black steel", "Linear LED"] },
      { name: "Smoked Oak & Marble", spec: ["Smoked grey lacquer", "Marble-look porcelain", "Brushed brass", "Warm cove light"] },
      { name: "Cream & Onyx", spec: ["Cream matte lacquer", "Black marble", "Matte black", "Recessed spots"] },
      { name: "Light Oak & Quartz", spec: ["Light oak and white", "White quartz", "Brushed steel", "Soft pendants"] },
    ],
  },
  contact: { eyebrow: "Free consultation", title: "Three questions, then we call you.", intro: "It takes under a minute. We reply within one working day.", steps: ["Your space", "Your need", "Your details"], next: "Next", back: "Back" },
};
export type PagesDict = typeof en;

const ar: PagesDict = {
  nav: { home: "الرئيسية", projects: "المشاريع", services: "الخدمات", studio: "الاستوديو", contact: "تواصل" },
  projects: {
    eyebrow: "أرشيف المشاريع", title: "كل بيت، كل غرفة.", view: "استكشف", all: "الكل",
    intro: "فيلات وشقق وعيادة في القاهرة والجيزة والشيخ زايد. اختر الفئة واستكشف المشاريع.",
    filters: { Villa: "فيلات", Apartment: "شقق", Clinic: "عيادات" },
  },
  services: {
    eyebrow: "الخدمات والباقات", title: "من الرسمة إلى باب البيت.", drawing: "الرسمة", render: "النتيجة", forLabel: "مثالية لـ", included: "ما تحصل عليه", cta: "احجز استشارة مجانية",
    intro: "اسحب الخط أو تابع حركته: كل غرفة في بايكال تبدأ برسم دقيق وتنتهي بمساحة مكتملة.",
    packages: [
      { name: "باقة التصميم ثلاثي الأبعاد", for: "من يريد أن يرى كل غرفة قبل أن يبدأ البناء.", items: ["رفع مقاسات المكان", "توزيع الأثاث ومخططات ثنائية الأبعاد", "لوحة الخامات والألوان", "صور ثري دي واقعية لكل غرفة", "جولة افتراضية 360°", "رسومات تنفيذية لأي مقاول"] },
      { name: "التصميم والتنفيذ", for: "من يريد فريقًا واحدًا يرافقه من أول رسم حتى التسليم.", items: ["كل ما في باقة الثري دي", "اختيار المقاولين والتنسيق بينهم", "إشراف دوري في الموقع", "توريد الأثاث والإضاءة", "قائمة الملاحظات والتنسيق النهائي", "تسليم مع دليل العناية"] },
    ],
    faqTitle: "أسئلة نسمعها كثيرًا",
    faq: [
      ["كم يستغرق المشروع؟", "يعتمد على مساحة المكان وعدد التعديلات، ونتفق على جدول زمني واضح في العرض قبل البدء."],
      ["هل تعملون خارج القاهرة؟", "نعم، نصمم في كل أنحاء مصر ومنها الإسكندرية، ونعمل عن بُعد مع العملاء في الخارج."],
      ["هل يمكنني البدء بالتصميم والتنفيذ لاحقًا؟", "نعم، باقة الثري دي تشمل رسومات تنفيذية كاملة يمكن لأي مقاول البناء منها، أو ننضم للتنفيذ لاحقًا."],
      ["كيف أحصل على عرض سعر؟", "احجز استشارة مجانية، نسألك عن المكان واحتياجك ثم نرسل لك عرضًا واضحًا."],
    ],
  },
  studio: {
    eyebrow: "الاستوديو", title: "شقيقتان، ولغة هادئة واحدة.", valuesTitle: "ما نتمسك به", cta: "ابدأ مشروعك",
    intro: "استوديو بايكال يحمل اسم أعمق بحيرة في العالم: هادئة على سطحها، عميقة وغنية بما تخفيه.",
    chapters: [
      ["حكايتنا", "يؤمن استوديو بايكال أن التصميم الجيد أكثر من مساحات جميلة؛ هو بيئات تعكس من يعيشون فيها، مستلهمة من عمق الطبيعة وتوازنها وسكينتها."],
      ["منهجنا", "نبدأ كل مشروع بتخطيط مدروس واهتمام بالتفاصيل وفهم عميق لرؤية العميل، لنصنع مساحات شخصية وراقية ومصممة لتدوم."],
      ["قيمنا", "تصميم لا يشيخ، وتفاصيل مدروسة، ونهج شخصي: مساحات تبقى أنيقة بعد انقضاء الموضة، وكل عنصر فيها محسوب ومفصّل على طريقة حياتك."],
    ],
  },
  config: {
    eyebrow: "اختر لوحة خاماتك", title: "مطبخ واحد، بخاماتك.", room: "المطبخ",
    intro: "اختر لوحة خامات وشاهد الواجهات والحجر والتشطيبات تتغير معًا. كل مشروع من بايكال يبدأ بلوحة مثل هذه.",
    fields: ["الواجهات", "الحجر", "التشطيب", "الإضاءة"],
    options: [
      { name: "جوز وجرانيت", spec: ["جوز وأبيض مطفي", "جرانيت أسود", "حديد أسود", "إضاءة LED خطية"] },
      { name: "بلوط مدخن ورخام", spec: ["لاكيه رمادي مدخن", "بورسلين بمظهر الرخام", "نحاس مصقول", "إضاءة دافئة مخفية"] },
      { name: "كريمي وأونيكس", spec: ["لاكيه كريمي مطفي", "رخام أسود", "أسود مطفي", "سبوتات مدفونة"] },
      { name: "بلوط فاتح وكوارتز", spec: ["بلوط فاتح وأبيض", "كوارتز أبيض", "ستيل مصقول", "معلقات ناعمة"] },
    ],
  },
  contact: { eyebrow: "استشارة مجانية", title: "ثلاثة أسئلة، ثم نتصل بك.", intro: "لن يستغرق الأمر أكثر من دقيقة، ونردّ عليك خلال يوم عمل واحد.", steps: ["مساحتك", "احتياجك", "بياناتك"], next: "التالي", back: "رجوع" },
};

export const pages: Record<Lang, PagesDict> = { en, ar };