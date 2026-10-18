import images from "./images.json";
import type { Lang } from "./i18n";

export type Img = { src: string; room: string; w: number; h: number };
export type Project = {
  slug: string; name: string; type: string; area: string; location: string; style: string; year: string; scope: string;
  blurb: string; story: string; materials: string[]; cover: string; images: Img[];
};
type Ar = Pick<Project, "name" | "type" | "location" | "style" | "scope" | "blurb" | "story" | "materials">;

const raw: (Omit<Project, "images"> & { ar: Ar })[] = [
  { slug: "el-nakhil-villa", name: "El Nakhil Villa", type: "Villa", area: "480 m²", location: "El Nakhil Compound, First Settlement, New Cairo", style: "Contemporary Classic", year: "2026", scope: "Full design & execution", cover: "/projects/el-nakhil-villa/01.webp",
    blurb: "A classic villa reinterpreted with warm neutrals, elegant mouldings and arched openings that frame every room.",
    story: "The family wanted the grandeur of a classic villa without the heaviness. We kept the symmetry, the mouldings and the arches, then calmed everything with a palette of ivory, oak and brass. Two receptions, a formal dining room and a double-height entrance set the tone; the bedrooms upstairs are softer and more private, each with its own character.",
    materials: ["Ivory plaster", "Oak herringbone", "Brushed brass", "Black steel arches", "Marble", "Linen"],
    ar: { name: "فيلا النخيل", type: "فيلا", location: "كمبوند النخيل، التجمع الأول، القاهرة الجديدة", style: "كلاسيك معاصر", scope: "تصميم وتنفيذ كامل", blurb: "فيلا كلاسيكية أُعيدت قراءتها بألوان دافئة وكرانيش أنيقة وأقواس تؤطر كل غرفة", story: "أرادت العائلة فخامة الفيلا الكلاسيكية بلا ثقل. حافظنا على التماثل والكرانيش والأقواس، ثم هدّأنا كل شيء بلوحة من العاجي والبلوط والنحاس. ريسبشنان وسفرة رسمية ومدخل بارتفاع مضاعف يحددون النغمة؛ وغرف النوم في الأعلى أنعم وأكثر خصوصية، لكل منها طابعها", materials: ["جبس عاجي", "باركيه بلوط هيرينجبون", "نحاس مصقول", "أقواس حديد أسود", "رخام", "كتان"] } },
  { slug: "maadi-285", name: "Maadi Residence", type: "Apartment", area: "285 m²", location: "Maadi, Cairo", style: "Organic Modern", year: "2026", scope: "Design & execution", cover: "/projects/maadi-285/01.webp",
    blurb: "Soft curves, walnut and stone bring a grounded calm to a generous family home.",
    story: "A wide apartment with long corridors became a sequence of rooms that flow into each other. A walnut coffee bar anchors the living area, the kitchen opens to the dining space, and the master suite gets a dressing room lined with mirrors and warm light.",
    materials: ["Walnut veneer", "Travertine", "Boucle", "Micro-cement", "Warm LED lighting"],
    ar: { name: "شقة المعادي", type: "شقة", location: "المعادي، القاهرة", style: "مودرن عضوي", scope: "تصميم وتنفيذ", blurb: "منحنيات ناعمة وجوز وحجر تمنح هدوءًا راسخًا لبيت عائلي رحب", story: "شقة واسعة بممرات طويلة تحولت إلى سلسلة غرف تنساب في بعضها. ركن قهوة من الجوز يرسّخ المعيشة، والمطبخ يفتح على السفرة، وجناح النوم الرئيسي حصل على غرفة ملابس مبطنة بالمرايا والضوء الدافئ", materials: ["قشرة جوز", "ترافرتين", "بوكليه", "ميكروسمنت", "إضاءة LED دافئة"] } },
  { slug: "october-250", name: "October Home", type: "Apartment", area: "250 m²", location: "6th of October City", style: "Warm Contemporary", year: "2026", scope: "3D package & execution", cover: "/projects/october-250/01.webp",
    blurb: "Layered textures and ambient light turn an open plan into a quiet, personal sanctuary.",
    story: "An open reception and dining room organised around an olive tree and a slatted wood wall. Soft linen seating, textured plaster and layered lighting make the space feel warm by day and intimate at night. The master bedroom and kids room continue the same calm language.",
    materials: ["Textured plaster", "Slatted oak", "Linen", "Rattan", "Stone"],
    ar: { name: "بيت أكتوبر", type: "شقة", location: "مدينة 6 أكتوبر", style: "معاصر دافئ", scope: "باقة ثري دي وتنفيذ", blurb: "طبقات من الخامات وإضاءة محيطة تحوّل المسقط المفتوح إلى ملاذ هادئ وشخصي", story: "ريسبشن وسفرة مفتوحان منظمان حول شجرة زيتون وحائط خشبي مشرّح. جلسة كتان ناعمة وجبس مُلمَّس وإضاءة متدرجة تجعل المكان دافئًا نهارًا وحميمًا ليلًا. غرفة النوم الرئيسية وغرفة الأطفال تكملان اللغة الهادئة نفسها", materials: ["جبس مُلمَّس", "بلوط مشرّح", "كتان", "راتان", "حجر"] } },
  { slug: "maadi-180", name: "Maadi Apartment", type: "Apartment", area: "180 m²", location: "Maadi, Cairo", style: "Organic Modern", year: "2026", scope: "Design & execution", cover: "/projects/maadi-180/05.webp",
    blurb: "Reception, dining and living flow as one, held together by a palette of sand and oak.",
    story: "A compact family apartment where every centimetre counts. The reception, dining and TV wall were designed as one continuous composition, with a green-tiled bar as the surprise. Bathrooms use large-format stone with hidden lighting to feel bigger than they are.",
    materials: ["Oak", "Green glazed tiles", "Large-format porcelain", "Sand plaster", "Black fittings"],
    ar: { name: "شقة المعادي 180", type: "شقة", location: "المعادي، القاهرة", style: "مودرن عضوي", scope: "تصميم وتنفيذ", blurb: "ريسبشن وسفرة ومعيشة تنساب كقطعة واحدة، تجمعها لوحة من الرملي والبلوط", story: "شقة عائلية مدمجة كل سنتيمتر فيها محسوب. صُمم الريسبشن والسفرة وحائط التلفزيون كتكوين واحد متصل، والمفاجأة بار بسيراميك أخضر. الحمّامات بحجر كبير المقاس وإضاءة مخفية لتبدو أكبر من حجمها", materials: ["بلوط", "سيراميك أخضر مزجج", "بورسلين كبير المقاس", "جبس رملي", "محابس سوداء"] } },
  { slug: "hadayek-el-ahram-200", name: "Hadayek El Ahram", type: "Apartment", area: "200 m²", location: "Hadayek El Ahram, Giza", style: "Modern Minimal", year: "2026", scope: "Full design & execution", cover: "/projects/hadayek-el-ahram-200/01.webp",
    blurb: "Clean lines, a dressing room with character, and a kitchen built for daily rituals.",
    story: "The brief was clarity: fewer objects, better ones. A dressing room with smoked glass wardrobes, a kitchen in matte cream and black, and a master bedroom that is almost monastic in its calm. The reception keeps the same restraint with one warm wood wall.",
    materials: ["Smoked glass", "Matte cream lacquer", "Black marble", "Oak", "Wool rugs"],
    ar: { name: "حدائق الأهرام", type: "شقة", location: "حدائق الأهرام، الجيزة", style: "مودرن مينيمال", scope: "تصميم وتنفيذ كامل", blurb: "خطوط نظيفة، وغرفة ملابس بشخصية، ومطبخ مبني للطقوس اليومية", story: "كان المطلوب الوضوح: أشياء أقل وأفضل. غرفة ملابس بدواليب زجاج مدخن، ومطبخ كريمي مطفي وأسود، وغرفة نوم رئيسية تكاد تكون رهبانية في هدوئها. الريسبشن يحافظ على الاقتصاد نفسه بحائط خشبي دافئ واحد", materials: ["زجاج مدخن", "لاكيه كريمي مطفي", "رخام أسود", "بلوط", "سجاد صوف"] } },
  { slug: "tagamo3-115", name: "Fifth Settlement Flat", type: "Apartment", area: "115 m²", location: "Fifth Settlement, New Cairo", style: "Playful Modern", year: "2026", scope: "3D package & execution", cover: "/projects/tagamo3-115/04.webp",
    blurb: "A compact plan made generous with curved seating, sculptural tables and bold art.",
    story: "A young couple who love colour. We kept the shell quiet (ivory walls, pale stone floor) and let the furniture speak: a curved boucle sofa, a sculpted oak table, emerald pendants and a large abstract canvas. Small apartment, big personality.",
    materials: ["Boucle", "Sculpted oak", "Emerald glass", "Ivory plaster", "Patterned rug"],
    ar: { name: "شقة التجمع الخامس", type: "شقة", location: "التجمع الخامس، القاهرة الجديدة", style: "مودرن مرح", scope: "باقة ثري دي وتنفيذ", blurb: "مسقط صغير صار رحبًا بجلسة منحنية وطاولات نحتية ولوحة جريئة", story: "زوجان شابان يحبان اللون. أبقينا الغلاف هادئًا (حوائط عاجية وأرضية حجر فاتح) وتركنا الأثاث يتكلم: كنبة بوكليه منحنية، وطاولة بلوط منحوتة، ونجف زمردي، ولوحة تجريدية كبيرة. شقة صغيرة بشخصية كبيرة", materials: ["بوكليه", "بلوط منحوت", "زجاج زمردي", "جبس عاجي", "سجادة منقوشة"] } },
  { slug: "mountain-view-zayed-80", name: "Mountain View Zayed", type: "Apartment", area: "80 m²", location: "Mountain View, Sheikh Zayed", style: "Moody Organic", year: "2025", scope: "Design & execution", cover: "/projects/mountain-view-zayed-80/03.webp",
    blurb: "Deep walnut and taupe create an intimate, hotel-like mood in a small footprint.",
    story: "A small apartment designed like a boutique hotel suite. Walnut panelling, taupe fabrics and sculptural pendants give the bedroom depth, while the bathrooms use pale stone and black fittings to stay crisp. Every storage piece is built in, so the rooms stay clear.",
    materials: ["Walnut panelling", "Taupe velvet", "Pale stone", "Black fittings", "Fluted glass"],
    ar: { name: "ماونتن فيو زايد", type: "شقة", location: "ماونتن فيو، الشيخ زايد", style: "عضوي داكن", scope: "تصميم وتنفيذ", blurb: "جوز داكن وطوبي يصنعان مزاجًا حميمًا يشبه الفنادق في مساحة صغيرة", story: "شقة صغيرة صُممت كجناح فندق بوتيك. تجاليد جوز وأقمشة طوبي ونجف نحتي تمنح غرفة النوم عمقًا، بينما الحمّامات بحجر فاتح ومحابس سوداء لتبقى حادة. كل قطعة تخزين مدمجة، فتبقى الغرف خالية", materials: ["تجاليد جوز", "قطيفة طوبي", "حجر فاتح", "محابس سوداء", "زجاج مضلع"] } },
  { slug: "ca-dental-clinic", name: "CA Dental Clinic", type: "Clinic", area: "60 m²", location: "Sheikh Zayed", style: "Calm Clinical", year: "2026", scope: "Full design & execution", cover: "/projects/ca-dental-clinic/04.webp",
    blurb: "Reception, clinics, X-ray and sterilisation rooms designed to feel warm, not sterile.",
    story: "Patients should relax before they sit in the chair. The reception uses an arched niche, soft seating and greenery; the two treatment rooms are bright and clean with warm wood storage. X-ray, sterilisation and a coffee corner for staff complete a compact, efficient plan.",
    materials: ["Oak laminate", "Solid surface counters", "Antibacterial paint", "Warm white lighting", "Greenery"],
    ar: { name: "عيادة CA للأسنان", type: "عيادة", location: "الشيخ زايد", style: "طبي هادئ", scope: "تصميم وتنفيذ كامل", blurb: "ريسبشن وعيادات وغرفة أشعة وتعقيم صُممت لتشعر بالدفء لا بالبرود", story: "يجب أن يرتاح المريض قبل أن يجلس على الكرسي. الريسبشن بكوة مقوّسة وجلسة ناعمة وخضرة؛ وغرفتا العلاج مشرقتان ونظيفتان بتخزين خشبي دافئ. الأشعة والتعقيم وركن قهوة للفريق يكملون مسقطًا مدمجًا وفعّالًا", materials: ["لامينيت بلوط", "كاونترات سوليد سيرفس", "دهان مضاد للبكتيريا", "إضاءة بيضاء دافئة", "خضرة"] } },
  { slug: "zayed-160", name: "Zayed Residence", type: "Apartment", area: "160 m²", location: "Sheikh Zayed", style: "Warm Minimal", year: "2026", scope: "Interior design", cover: "/projects/zayed-160/02.webp",
    blurb: "Curved sofas, oak slats and soft light give a family apartment an easy, gathered calm.",
    story: "Living, dining and a kitchen with a breakfast bar share one open plan, framed by an oak slatted divider and layered ceiling light. The bedrooms stay quiet in sand and walnut, with a twin room for the children and a compact study corner.",
    materials: ["Oak slats", "Boucle", "Black granite", "Walnut", "Olive velvet"],
    ar: { name: "شقة الشيخ زايد", type: "شقة", location: "الشيخ زايد", style: "مينيمال دافئ", scope: "تصميم داخلي", blurb: "كنب منحني وشرائح بلوط وإضاءة ناعمة تمنح شقة عائلية هدوءًا يجمع الجميع", story: "المعيشة والسفرة ومطبخ ببار إفطار يتشاركون مسقطًا مفتوحًا واحدًا، يحدده فاصل من شرائح البلوط وإضاءة سقف متدرجة. غرف النوم هادئة بالرملي والجوز، مع غرفة بسريرين للأطفال وركن مكتب صغير", materials: ["شرائح بلوط", "بوكليه", "جرانيت أسود", "جوز", "قطيفة زيتوني"] } },
  { slug: "mountain-view-ivilla-235", name: "Mountain View iVilla", type: "Villa", area: "235 m²", location: "Mountain View, iVilla", style: "Organic Modern", year: "2026", scope: "Interior design", cover: "/projects/mountain-view-ivilla-235/05.webp",
    blurb: "A two-level iVilla with a sculpted staircase, a calm reception and a garden terrace for slow evenings.",
    story: "Reception and living spaces open onto a small garden terrace furnished for long evenings. A sculpted staircase with a lit round mirror leads to the bedrooms, while the guest bathroom goes dark and dramatic with a backlit organic mirror.",
    materials: ["Microcement", "Walnut", "Linen", "Backlit mirrors", "Rattan"],
    ar: { name: "آي فيلا ماونتن فيو", type: "فيلا", location: "ماونتن فيو، آي فيلا", style: "مودرن عضوي", scope: "تصميم داخلي", blurb: "آي فيلا من دورين بسلم منحوت وريسبشن هادئ وتراس حديقة للأمسيات الطويلة", story: "الريسبشن والمعيشة يفتحان على تراس حديقة صغير مفروش للسهرات. سلم منحوت بمرآة دائرية مضيئة يقود إلى غرف النوم، بينما حمّام الضيوف داكن ودرامي بمرآة عضوية مضاءة من الخلف", materials: ["ميكروسمنت", "جوز", "كتان", "مرايا مضاءة", "راتان"] } },
  { slug: "morouj-alexandria-120", name: "Morouj Apartment", type: "Apartment", area: "120 m²", location: "Morouj Compound, Alexandria", style: "Family Contemporary", year: "2026", scope: "Interior design", cover: "/projects/morouj-alexandria-120/07.webp",
    blurb: "A compact family flat with a calm reception, two playful children's rooms and a balcony garden.",
    story: "Every room is planned around a growing family: a light reception with a long low unit, a boy's room in deep blue with a moon wall, a girl's room in blush with stars, and a balcony turned into a small garden.",
    materials: ["Oak", "Blush lacquer", "Navy paint", "Brass fittings", "Rattan"],
    ar: { name: "شقة مروج", type: "شقة", location: "كمبوند مروج، الإسكندرية", style: "معاصر عائلي", scope: "تصميم داخلي", blurb: "شقة عائلية مدمجة بريسبشن هادئ وغرفتي أطفال مرحتين وبلكونة تحولت إلى حديقة", story: "كل غرفة مخططة لعائلة تكبر: ريسبشن فاتح بوحدة طويلة منخفضة، وغرفة ولد بالأزرق الداكن وحائط قمر، وغرفة بنت بالوردي الهادئ والنجوم، وبلكونة تحولت إلى حديقة صغيرة", materials: ["بلوط", "لاكيه وردي", "دهان كحلي", "محابس نحاسية", "راتان"] } },
  { slug: "nasr-city-108", name: "Nasr City Apartment", type: "Apartment", area: "108 m²", location: "Madinet Nasr, Cairo", style: "Soft Modern", year: "2026", scope: "Interior design", cover: "/projects/nasr-city-108/02.webp",
    blurb: "Arched doors, creamy plaster and a gallery wall turn a 108 m² flat into something soft and personal.",
    story: "We rounded the edges: arched walnut doors, a curved sofa and a plaster texture wall in the living room, a gallery wall in the reception, and a calm bathroom in pale stone with a backlit mirror and black fittings.",
    materials: ["Arched walnut doors", "Plaster texture", "Boucle", "Pale stone", "Black fittings"],
    ar: { name: "شقة مدينة نصر", type: "شقة", location: "مدينة نصر، القاهرة", style: "مودرن ناعم", scope: "تصميم داخلي", blurb: "أبواب مقوّسة وجبس كريمي وحائط لوحات تحوّل شقة 108 م² إلى مساحة ناعمة وشخصية", story: "دوّرنا الحواف: أبواب جوز مقوّسة، وكنبة منحنية وحائط جبس مُلمَّس في المعيشة، وحائط لوحات في الريسبشن، وحمّام هادئ بحجر فاتح ومرآة مضاءة ومحابس سوداء", materials: ["أبواب جوز مقوّسة", "جبس مُلمَّس", "بوكليه", "حجر فاتح", "محابس سوداء"] } },
];

const fixEn: Record<string, string> = { "coffe corner": "Coffee corner", "main bathrrom": "Main bathroom", "Msterbedroom": "Master bedroom", "mainbathroom": "Main bathroom", "Salams bedroom": "Second bedroom", "reception 1": "Reception", "reception 2": "Second reception", "clinic 2": "Treatment room 2", "main clinic 1": "Main treatment room", "reception and dining": "Reception & dining", "Bathroom2": "Guest bathroom", "livingroom": "Living room", "master beroom": "Master bedroom", "Master Bedroom": "Master bedroom", "entrance and coffee corner": "Entrance & coffee corner", "sterilization room": "Sterilisation room", "laundryroom": "Laundry room", "stair first floor": "Staircase", "outdoor": "Garden", "masterbedroom": "Master bedroom", "LIVINGROOM": "Living room", "boy bedroom": "Boy's bedroom", "girl bedroom": "Girl's bedroom" };
const roomAr: Record<string, string> = { "Coffee corner": "ركن القهوة", "Main bathroom": "الحمّام الرئيسي", "Master bedroom": "غرفة النوم الرئيسية", "Second bedroom": "غرفة نوم ثانية", "Reception": "الريسبشن", "Second reception": "ريسبشن ثانٍ", "Treatment room 2": "غرفة علاج 2", "Main treatment room": "غرفة العلاج الرئيسية", "Reception & dining": "ريسبشن وسفرة", "Guest bathroom": "حمّام الضيوف", "Living room": "المعيشة", "Dining": "السفرة", "Entrance": "المدخل", "Guest bedroom": "غرفة الضيوف", "Hall": "الصالة", "Kitchen": "المطبخ", "Office": "المكتب", "Bathroom": "الحمّام", "X-ray room": "غرفة الأشعة", "Sterilization room": "غرفة التعقيم", "Kids bedroom": "غرفة الأطفال", "Dressing room": "غرفة الملابس", "Tv wall": "حائط التلفزيون", "Livingroom": "المعيشة", "Entrance & coffee corner": "المدخل وركن القهوة", "Sterilisation room": "غرفة التعقيم", "Laundry room": "غرفة الغسيل", "Staircase": "السلم", "Garden": "الحديقة", "Balcony": "البلكونة", "Boy's bedroom": "غرفة الولد", "Girl's bedroom": "غرفة البنت" };
const roomEn = (r: string) => { const f = fixEn[r] ?? r; return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase().replace("x-ray", "X-ray"); };

export const projects: Project[] = raw.map(({ ar: _ar, ...p }) => ({ ...p, images: ((images as Record<string, Img[]>)[p.slug] ?? []).map((i) => ({ ...i, room: roomEn(i.room) })) }));
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/* Same project in the requested language (rooms included). */
export function localize(p: Project, lang: Lang): Project {
  if (lang === "en") return p;
  const a = raw.find((r) => r.slug === p.slug)!.ar;
  return { ...p, ...a, images: p.images.map((i) => ({ ...i, room: roomAr[i.room] ?? i.room })) };
}

export const contact = {
  email: "design@baikalstudio.com",
  phone: "+20 111 0004623",
  phoneHref: "tel:+201110004623",
  whatsapp: "https://wa.me/201110004623?text=Hi%20Studio%20Baikal%2C%20I%27d%20like%20a%20free%20consultation",
  instagram: "https://www.instagram.com/studio_baikal/",
};