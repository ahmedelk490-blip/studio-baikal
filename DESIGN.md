# DESIGN.md — Studio Baikal

**Promise:** Where design meets depth. Interior & exterior spaces inspired by nature, rooted in structure (Egypt).
**Mood:** warm stone, oak, brass; quiet luxury; arches; dusk light. Founded by two sisters.

## Concept (v4, 2026-10-17): "Descend into depth"
Baikal is the deepest lake on earth and the tagline is "Where design meets depth", so the home page is a dive:
light surface at the top, deep blue-black below, a fixed depth gauge on the right (0 m Surface -> 1,642 m Contact),
a waterline hero (headline left / intro right on one bronze line, full-bleed self-changing room below),
project "strata" rows that light a full-bleed photo, a pinned five-room tour, three service columns,
edge-to-edge material squares, a descent line for the approach, a lit studio panel, and a bronze lamp at the lake floor.
Sharp corners everywhere, film grain on deep sections, Fraunces display + Manrope.

## Tokens
- Colours: `--surface #F3F0EA` · `--mist #E4E2DB` · `--deep #0B1013` · `--deeper #05080A` · `--ink #10161A` · `--bronze #C49A5C` · `--ice #C9DADC` · `--muted #6E7672`. Materials band `#0F1A1E`.
- Type: display **Fraunces** variable (opsz 144, SOFT 60, WONK 1) class `.display`; UI **Manrope** 400-600. Headline 7.4vw desktop / 14vw phone. Eyebrows 12px uppercase tracking .2em (never on Arabic).
- Radius: 0 (sharp) on all photos and buttons; hairlines 1px at 15-20% opacity.
- Motion: masked line reveal (power4.out 1.2s), clip-path reveals (expo.inOut 1.3-1.4s), photo drift 20s, Lenis lerp .09, ScrollTrigger scrub .4-.8, pinned rooms 85% per scene. Reduced-motion: no preloader/drift.
- Spacing: sections py-24 / md:py-32; full-bleed with px-5 / md:px-10 (no max-width container).

## Rooms (home, in order, with gauge depth)
Preloader -> Hero "Surface" 0 m -> Statement 20 m -> Projects strata 80 m (deep) -> Rooms 300 m (pinned) -> Services 500 m -> Materials 800 m -> Approach 1,100 m -> Studio 1,400 m (lit panel) -> Contact 1,642 m (lamp) -> Footer.

## Project page
Full-bleed cover + title -> spec row (type / area / rooms / year / style / scope) -> story + materials list -> dive-log gallery (sticky room index, lightbox) -> next project.

## v6 (2026-10-17)
EN default (/ -> /en), AR at /ar (RTL, Alexandria). Signature effects per section: porthole statement, blinds strata, featured mask reveals, circle-change rooms, expanding service panels (light), sample lens materials, travelling-dot approach (light), lit studio, lamp contact, rising wordmark footer, page curtain. Project photos uncropped at natural ratio.

## Never
Text over photos with text/logos · stats counters · marquee · custom cursor · backdrop-blur on fixed bars · letter-spaced Arabic · lorem · starter favicon.
