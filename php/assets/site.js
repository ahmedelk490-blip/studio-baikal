/* Studio Baikal, PHP edition: the page's behaviour in plain JavaScript (the React site's client parts,
   one by one): fade-ins, the menu, the project hall, the archive filter, the photo viewer, the
   questions, the booking form, the footer wordmark and the gold dust of the contact section. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // blocks fade up once as they reach the screen; photos in a .mask wipe open. Measured each frame while
  // any remain (a few rects, cheap), which never misses the way an observer can
  const left = new Map([...$$("[data-fade]").map((el) => [el, "calm-in"]), ...$$(".mask").map((el) => [el, "in"])]);
  const tick = () => {
    const line = innerHeight * 0.9;
    for (const [el, cls] of left) { const r = el.getBoundingClientRect(); if ((r.top < line && r.bottom > 0) || r.bottom < 0) { el.classList.add(cls); left.delete(el); } }
    if (left.size) requestAnimationFrame(tick);
  };
  tick();

  // the menu drops down under the header
  const header = $("[data-header]"), menuBtn = $("[data-menu]"), mnav = $("#mnav");
  if (menuBtn && mnav) {
    const set = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open)); mnav.classList.toggle("is-open", open); mnav.inert = !open;
      header.classList.toggle("bg-[#0B1013]", open); header.classList.toggle("bg-gradient-to-b", !open); header.classList.toggle("from-[var(--deep)]/70", !open); header.classList.toggle("to-transparent", !open);
      const b1 = $("[data-bar='1']", menuBtn), b2 = $("[data-bar='2']", menuBtn), b3 = $("[data-bar='3']", menuBtn);
      b1.classList.toggle("translate-y-[6px]", open); b1.classList.toggle("rotate-45", open); b2.classList.toggle("opacity-0", open); b3.classList.toggle("-translate-y-[6px]", open); b3.classList.toggle("-rotate-45", open);
    };
    menuBtn.addEventListener("click", () => set(menuBtn.getAttribute("aria-expanded") !== "true"));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // the project hall turns by itself; arrows, a swipe or a tap on a side arch take over for 7 s
  const hall = $("[data-hall]");
  if (hall) {
    const stage = $("[data-stage]", hall), arches = $$("[data-arch]", stage), n = arches.length;
    const label = $("[data-hall-label]", hall), name = $("[data-hall-name]", hall), sub = $("[data-hall-sub]", hall);
    let a = 0, hold = 0, span = innerWidth < 768 ? 1 : 2, seen = false;
    const rel = (k) => { let d = (k - a) % n; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; };
    const paint = (fresh) => {
      arches.forEach((el, k) => {
        const d = rel(k), ad = Math.abs(d), front = d === 0, hide = ad > span;
        el.style.transform = `translateX(-50%) translateX(calc(${d} * var(--step))) translateZ(${-ad * 140}px) rotateY(${-d * 16}deg)`;
        el.style.opacity = hide ? "0" : String(1 - ad * 0.16); el.style.zIndex = String(20 - ad); el.style.pointerEvents = hide ? "none" : "auto"; el.style.visibility = hide ? "hidden" : "visible";
        el.style.filter = front ? "none" : "brightness(.62)"; el.tabIndex = hide ? -1 : 0;
        $("[data-ring]", el).classList.toggle("shadow-[inset_0_0_0_1.5px_var(--bronze)]", front);
      });
      name.textContent = arches[a].dataset.name; sub.textContent = arches[a].dataset.sub;
      if (fresh) { label.classList.remove("hero-in"); void label.offsetWidth; label.classList.add("hero-in"); }
    };
    const go = (k) => { hold = Date.now() + 7000; a = ((k % n) + n) % n; paint(true); };
    arches.forEach((el, k) => el.addEventListener("click", (e) => { if (rel(k) !== 0) { e.preventDefault(); go(k); } }));
    $$("[data-dir]", hall).forEach((b) => b.addEventListener("click", () => go(a + Number(b.dataset.dir))));
    let down = null;
    stage.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener("pointerup", (e) => { const d = down; down = null; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(a + (dx < 0 ? 1 : -1)); });
    addEventListener("resize", () => { const s = innerWidth < 768 ? 1 : 2; if (s !== span) { span = s; paint(false); } });
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { rootMargin: "300px 0px" }).observe(hall);
    if (!reduce && n > 1) setInterval(() => { if (seen && !document.hidden && Date.now() > hold) { a = (a + 1) % n; paint(true); } }, 3600);
    paint(false);
  }

  // archive filter: plain words, the covers of the other kinds hide
  const filters = $("[data-filters]"), archive = $("[data-archive]");
  if (filters && archive) filters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kind]"); if (!b) return;
    const k = b.dataset.kind;
    $$("[data-kind]", filters).forEach((x) => { const on = x === b; x.setAttribute("aria-selected", String(on)); x.classList.toggle("text-[var(--surface)]", on); x.classList.toggle("text-[var(--surface)]/50", !on); const u = x.lastElementChild; u.classList.toggle("scale-x-100", on); u.classList.toggle("scale-x-0", !on); });
    $$("li[data-kind]", archive).forEach((li, i) => { const show = k === "all" || li.dataset.kind === k; li.hidden = !show; if (show) { li.classList.remove("calm-in"); setTimeout(() => li.classList.add("calm-in"), 30 + (i % 3) * 90); } });
    history.replaceState(null, "", k === "all" ? location.pathname : `${location.pathname}?type=${k}`);
  });

  // the photo viewer of a project page
  const gal = $("[data-gallery]");
  if (gal) {
    const data = JSON.parse($("[data-images]", gal).textContent), imgs = data.images; let open = null, box = null;
    const u = "text-xs uppercase tracking-[0.16em] rtl:tracking-normal";
    const close = () => { if (box) box.remove(); box = null; open = null; document.body.style.overflow = ""; };
    const show = (k) => {
      open = (k + imgs.length) % imgs.length; const im = imgs[open];
      if (!box) {
        box = document.createElement("div"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", `${data.name} ${data.labels.gallery}`);
        box.className = "popup fixed inset-0 z-[80] grid place-items-center bg-[var(--deeper)]/95 p-4";
        box.innerHTML = `<figure class="popup-img relative max-h-[86vh] max-w-[96vw]"><img class="h-auto max-h-[86vh] w-auto max-w-[96vw]" alt=""><figcaption class="${u} absolute bottom-3 start-3 rounded-full bg-[var(--deep)]/70 px-3 py-1.5 text-[var(--surface)]"></figcaption></figure>
          <button data-step="-1" aria-label="${data.labels.prev}" class="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8249;</button>
          <button data-step="1" aria-label="${data.labels.next}" class="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)]/10 text-[var(--surface)]">&#8250;</button>
          <button data-close aria-label="${data.labels.close}" class="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--surface)]/10 text-xl text-[var(--surface)]">&#215;</button>`;
        box.addEventListener("click", (e) => { const s = e.target.closest("[data-step]"); if (s) { e.stopPropagation(); show(open + Number(s.dataset.step)); return; } if (e.target.closest("[data-close]") || !e.target.closest("figure")) close(); });
        document.body.appendChild(box); document.body.style.overflow = "hidden";
      }
      const fig = $("figure", box); fig.classList.remove("popup-img"); void fig.offsetWidth; fig.classList.add("popup-img");
      const img = $("img", box); img.src = im.src; img.alt = `${data.name}, ${im.room}`; img.width = im.w; img.height = im.h;
      $("figcaption", box).innerHTML = `${im.room} · <span dir="ltr">${open + 1} / ${imgs.length}</span>`;
    };
    gal.addEventListener("click", (e) => { const b = e.target.closest("[data-open]"); if (b) show(Number(b.dataset.open)); });
    addEventListener("keydown", (e) => { if (open === null) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") show(open + 1); if (e.key === "ArrowLeft") show(open - 1); });
  }

  // the questions open one at a time
  const faq = $("[data-faq]");
  if (faq) faq.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const was = b.getAttribute("aria-expanded") === "true";
    $$("li", faq).forEach((li) => { const bb = $("button", li), on = bb === b && !was; bb.setAttribute("aria-expanded", String(on)); $(".faq-x", bb).classList.toggle("on", on); const g = bb.nextElementSibling; g.classList.toggle("grid-rows-[1fr]", on); g.classList.toggle("grid-rows-[0fr]", !on); });
  });

  // the booking form: chips, then one request to /api/leads
  const form = $("[data-lead-form]");
  if (form) {
    const on = "border-[var(--bronze)] bg-[var(--bronze)] text-[var(--deep)]", off = "border-[var(--surface)]/25 text-[var(--surface)]/80";
    const style = (c, sel) => { c.setAttribute("aria-pressed", String(sel)); on.split(" ").forEach((x) => c.classList.toggle(x, sel)); off.split(" ").forEach((x) => c.classList.toggle(x, !sel)); };
    $$("[data-chip]", form).forEach((c) => style(c, c.getAttribute("aria-pressed") === "true"));
    form.addEventListener("click", (e) => { const c = e.target.closest("[data-chip]"); if (!c) return; const sel = c.getAttribute("aria-pressed") !== "true"; $$(`[data-chip='${c.dataset.chip}']`, form).forEach((x) => style(x, x === c && sel)); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pick = (g) => { const c = $(`[data-chip='${g}'][aria-pressed='true']`, form); return c ? c.dataset.value : ""; };
      const lbl = $("[data-send-label]", form), btn = $("button.btn", form), err = $("[data-form-error]", form), sendText = lbl.textContent;
      lbl.textContent = form.dataset.sending; btn.disabled = true; err.hidden = true;
      const body = { name: form.name.value, whatsapp: form.whatsapp.value, size: pick("size"), need: pick("need"), area: pick("area"), area_label: form.area_label.value, website: form.website.value, source: location.href };
      const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
      if (r && r.ok) { lbl.textContent = form.dataset.thanks; setTimeout(() => { form.hidden = true; $("[data-thanks]").hidden = false; }, 1200); }
      else { lbl.textContent = sendText; btn.disabled = false; err.hidden = false; }
    });
  }

  // the footer: the line draws and the letters rise once on screen; the bronze outline follows the pointer
  const wm = $("[data-wordmark]"), ft = $("[data-footer]");
  if (wm && ft) {
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { wm.classList.add("in"); ft.classList.add("in"); o.disconnect(); } }, { threshold: 0.15 }).observe(wm);
    if (matchMedia("(hover: hover)").matches) ft.addEventListener("pointermove", (e) => { const r = wm.getBoundingClientRect(); wm.style.setProperty("--mx", `${e.clientX - r.left}px`); wm.style.setProperty("--my", `${e.clientY - r.top}px`); });
  }

  // gold dust drifting towards the viewer, only while the contact section is on screen
  const cv = $("[data-depth-field]");
  if (cv) {
    const x = cv.getContext("2d"), N = innerWidth < 768 ? 90 : 160;
    const P = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    let W = 0, H = 0, raf = 0, seen = false, last = performance.now();
    const fit = () => { const d = Math.min(innerWidth < 768 ? 1.5 : 2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); };
    const draw = (dt) => {
      x.clearRect(0, 0, W, H); const f = Math.max(W, H) * 0.42;
      for (const p of P) {
        p.z -= dt * 0.07; if (p.z <= 0.04) { p.x = (Math.random() - 0.5) * 2; p.y = (Math.random() - 0.5) * 2; p.z = 1; }
        const sx = W / 2 + (p.x / p.z) * f * 0.5, sy = H / 2 + (p.y / p.z) * f * 0.5; if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
        const k = 1 - p.z; x.fillStyle = `rgba(222,178,112,${(0.12 + k * 0.75).toFixed(3)})`; x.beginPath(); x.arc(sx, sy, 0.4 + k * 2.4, 0, Math.PI * 2); x.fill();
      }
    };
    const loop = (now) => { draw(Math.min(0.05, (now - last) / 1000)); last = now; raf = seen && !document.hidden ? requestAnimationFrame(loop) : 0; };
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } }).observe(cv);
    new ResizeObserver(() => { fit(); if (reduce) draw(0); }).observe(cv);
    fit(); if (reduce) draw(0);
  }
})();
