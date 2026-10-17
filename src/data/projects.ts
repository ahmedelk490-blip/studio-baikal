import images from "./images.json";

export type Img = { src: string; room: string };
export type Project = {
  slug: string; name: string; type: string; area: string; location: string; style: string; year: string; scope: string;
  blurb: string; story: string; materials: string[]; cover: string; images: Img[];
};

const raw: Omit<Project, "images">[] = [
  { slug: "el-nakhil-villa", name: "El Nakhil Villa", type: "Villa", area: "480 m²", location: "El Nakhil Compound, First Settlement, New Cairo", style: "Contemporary Classic", year: "2026", scope: "Full design & execution", cover: "/projects/el-nakhil-villa/01.webp",
    blurb: "A classic villa reinterpreted with warm neutrals, elegant mouldings and arched openings that frame every room.",
    story: "The family wanted the grandeur of a classic villa without the heaviness. We kept the symmetry, the mouldings and the arches, then calmed everything with a palette of ivory, oak and brass. Two receptions, a formal dining room and a double-height entrance set the tone; the bedrooms upstairs are softer and more private, each with its own character.",
    materials: ["Ivory plaster", "Oak herringbone", "Brushed brass", "Black steel arches", "Marble", "Linen"] },
  { slug: "maadi-285", name: "Maadi Residence", type: "Apartment", area: "285 m²", location: "Maadi, Cairo", style: "Organic Modern", year: "2026", scope: "Design & execution", cover: "/projects/maadi-285/01.webp",
    blurb: "Soft curves, walnut and stone bring a grounded calm to a generous family home.",
    story: "A wide apartment with long corridors became a sequence of rooms that flow into each other. A walnut coffee bar anchors the living area, the kitchen opens to the dining space, and the master suite gets a dressing room lined with mirrors and warm light.",
    materials: ["Walnut veneer", "Travertine", "Boucle", "Micro-cement", "Warm LED lighting"] },
  { slug: "october-250", name: "October Home", type: "Apartment", area: "250 m²", location: "6th of October City", style: "Warm Contemporary", year: "2026", scope: "3D package & execution", cover: "/projects/october-250/01.webp",
    blurb: "Layered textures and ambient light turn an open plan into a quiet, personal sanctuary.",
    story: "An open reception and dining room organised around an olive tree and a slatted wood wall. Soft linen seating, textured plaster and layered lighting make the space feel warm by day and intimate at night. The master bedroom and kids room continue the same calm language.",
    materials: ["Textured plaster", "Slatted oak", "Linen", "Rattan", "Stone"] },
  { slug: "maadi-180", name: "Maadi Apartment", type: "Apartment", area: "180 m²", location: "Maadi, Cairo", style: "Organic Modern", year: "2026", scope: "Design & execution", cover: "/projects/maadi-180/05.webp",
    blurb: "Reception, dining and living flow as one, held together by a palette of sand and oak.",
    story: "A compact family apartment where every centimetre counts. The reception, dining and TV wall were designed as one continuous composition, with a green-tiled bar as the surprise. Bathrooms use large-format stone with hidden lighting to feel bigger than they are.",
    materials: ["Oak", "Green glazed tiles", "Large-format porcelain", "Sand plaster", "Black fittings"] },
  { slug: "hadayek-el-ahram-200", name: "Hadayek El Ahram", type: "Apartment", area: "200 m²", location: "Hadayek El Ahram, Giza", style: "Modern Minimal", year: "2026", scope: "Full design & execution", cover: "/projects/hadayek-el-ahram-200/01.webp",
    blurb: "Clean lines, a dressing room with character, and a kitchen built for daily rituals.",
    story: "The brief was clarity: fewer objects, better ones. A dressing room with smoked glass wardrobes, a kitchen in matte cream and black, and a master bedroom that is almost monastic in its calm. The reception keeps the same restraint with one warm wood wall.",
    materials: ["Smoked glass", "Matte cream lacquer", "Black marble", "Oak", "Wool rugs"] },
  { slug: "tagamo3-115", name: "Fifth Settlement Flat", type: "Apartment", area: "115 m²", location: "Fifth Settlement, New Cairo", style: "Playful Modern", year: "2026", scope: "3D package & execution", cover: "/projects/tagamo3-115/04.webp",
    blurb: "A compact plan made generous with curved seating, sculptural tables and bold art.",
    story: "A young couple who love colour. We kept the shell quiet (ivory walls, pale stone floor) and let the furniture speak: a curved boucle sofa, a sculpted oak table, emerald pendants and a large abstract canvas. Small apartment, big personality.",
    materials: ["Boucle", "Sculpted oak", "Emerald glass", "Ivory plaster", "Patterned rug"] },
  { slug: "mountain-view-zayed-80", name: "Mountain View Zayed", type: "Apartment", area: "80 m²", location: "Mountain View, Sheikh Zayed", style: "Moody Organic", year: "2025", scope: "Design & execution", cover: "/projects/mountain-view-zayed-80/03.webp",
    blurb: "Deep walnut and taupe create an intimate, hotel-like mood in a small footprint.",
    story: "A small apartment designed like a boutique hotel suite. Walnut panelling, taupe fabrics and sculptural pendants give the bedroom depth, while the bathrooms use pale stone and black fittings to stay crisp. Every storage piece is built in, so the rooms stay clear.",
    materials: ["Walnut panelling", "Taupe velvet", "Pale stone", "Black fittings", "Fluted glass"] },
  { slug: "ca-dental-clinic", name: "CA Dental Clinic", type: "Clinic", area: "60 m²", location: "Sheikh Zayed", style: "Calm Clinical", year: "2026", scope: "Full design & execution", cover: "/projects/ca-dental-clinic/05.webp",
    blurb: "Reception, clinics, X-ray and sterilisation rooms designed to feel warm, not sterile.",
    story: "Patients should relax before they sit in the chair. The reception uses an arched niche, soft seating and greenery; the two treatment rooms are bright and clean with warm wood storage. X-ray, sterilisation and a coffee corner for staff complete a compact, efficient plan.",
    materials: ["Oak laminate", "Solid surface counters", "Antibacterial paint", "Warm white lighting", "Greenery"] },
];

const fix: Record<string, string> = { "coffe corner": "Coffee corner", "main bathrrom": "Main bathroom", "Msterbedroom": "Master bedroom", "mainbathroom": "Main bathroom", "Salams bedroom": "Second bedroom", "reception 1": "Reception", "reception 2": "Second reception", "clinic 2": "Treatment room 2", "main clinic 1": "Main treatment room", "reception and dining": "Reception & dining", "Bathroom2": "Guest bathroom", "livingroom": "Living room" };
export const roomName = (r: string) => { const f = fix[r] ?? r; return f.charAt(0).toUpperCase() + f.slice(1); };

export const projects: Project[] = raw.map((p) => ({ ...p, images: ((images as Record<string, Img[]>)[p.slug] ?? []).map((i) => ({ ...i, room: roomName(i.room) })) }));
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const contact = {
  email: "design@baikalstudio.com",
  phone: "+20 111 0004623",
  phoneHref: "tel:+201110004623",
  whatsapp: "https://wa.me/201110004623?text=Hi%20Studio%20Baikal%2C%20I%27d%20like%20a%20free%20consultation",
  instagram: "https://www.instagram.com/studio_baikal/",
};